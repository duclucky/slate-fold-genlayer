"""Actual gltest direct fixtures with bounded Windows/runtime compatibility.

The pinned upstream unlinks a file while fd0 still owns its Windows handle.
Delay only that unlink until fd0 is restored. Reset the SDK's single-contract
registration for each independent deployment. No application rule is mocked.
"""
import os
import tempfile
from pathlib import Path

import pytest
from gltest.direct import loader, sdk_loader
from gltest.direct.vm import VMContext

# v0.3 transports JSON as text inside {ok: ...}; pinned gltest still
# auto-decodes it for the older wire format. Preserve the response bytes.
from gltest.direct import wasi_mock
_llm_request = wasi_mock._handle_llm_request


def llm_wire(vm, data):
    response = vm._match_llm_mock(data.get("prompt", ""))
    return {"ok": response} if response is not None else _llm_request(vm, data)


wasi_mock._handle_llm_request = llm_wire


sdk_loader.CACHE_DIR = Path(__file__).resolve().parents[1] / ".codex" / "direct-cache"
sdk_loader.BUNDLE_CACHE_DIR = sdk_loader.CACHE_DIR / "bundles-v2"
sdk_loader.TREE_CACHE_DIR = sdk_loader.CACHE_DIR / "trees-v2"

if os.name == "nt":
    _cleanup = VMContext._cleanup_after_deactivate

    def inject(vm):
        from genlayer import calldata
        from genlayer.types import Address
        message = vm.get_message_raw()
        for key in ("contract_address", "sender_address", "origin_address"):
            if isinstance(message[key], bytes):
                message[key] = Address(message[key])
        encoded = calldata.encode(message)
        fd, path = tempfile.mkstemp()
        try:
            os.write(fd, encoded)
            os.lseek(fd, 0, os.SEEK_SET)
            vm._original_stdin_fd = os.dup(0)
            os.dup2(fd, 0)
            vm._slatefold_stdin_path = path
        finally:
            os.close(fd)

    def cleanup(vm):
        try:
            _cleanup(vm)
        finally:
            path = getattr(vm, "_slatefold_stdin_path", None)
            if path:
                os.unlink(path)
                vm._slatefold_stdin_path = None

    loader._inject_message_to_fd0 = inject
    VMContext._cleanup_after_deactivate = cleanup

_load_module = loader._load_module


def fresh_module(path):
    import genlayer.contract as api
    api.__known_contract__ = None
    return _load_module(path)


loader._load_module = fresh_module


@pytest.fixture
def direct_deploy(direct_vm):
    def deploy(path="contracts/slate_fold.py", *args):
        return loader.deploy_contract(Path(path).resolve(), direct_vm, *args, sdk_version="v0.6.0-rc5")
    return deploy
