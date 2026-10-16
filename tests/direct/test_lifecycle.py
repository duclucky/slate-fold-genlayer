"""Behavioral regression cards, written before completing the public writes."""
import json
from datetime import datetime, timezone
import pytest

GEN = 10**18
START = 1900000000


def clock(vm, n):
    import genlayer as gl
    stamp = datetime.fromtimestamp(n, timezone.utc).isoformat()
    vm.warp(stamp)
    # Pinned direct SDK refreshes addresses/value but omits raw datetime.
    gl.message.raw["datetime"] = stamp


@pytest.fixture
def council(direct_deploy, direct_vm, direct_alice, direct_bob, direct_charlie):
    c = direct_deploy()
    vm = direct_vm
    from genlayer.types import Address
    actors = [a if isinstance(a, Address) else Address(a) for a in (direct_alice, direct_bob, direct_charlie)]
    clock(vm, START)
    vm.sender = actors[0]
    vm.value = 2*GEN
    c.create_round("alpha", "Archive council", "Choose bounded archive permission.", actors[1].as_hex, actors[2].as_hex, START+100, START+200, START+300)
    vm.value = 0
    return c, vm, actors


def state(c):
    return c.get_round("alpha"), c.get_accounting()


def complete(c, vm, actors, choices=(1,2,3)):
    config = json.loads(c.get_round("alpha"))["configDigest"]
    for i, actor in enumerate(actors):
        vm.sender = actor
        c.submit_motion("alpha", config, f"Permit council members to read archive {i}; forbid redistribution.")
    clock(vm, START+100)
    slate = json.loads(c.get_round("alpha"))["slateDigest"]
    for actor, choice in zip(actors, choices):
        vm.sender = actor
        c.cast_ballot("alpha", slate, choice)
    clock(vm, START+200)


@pytest.mark.parametrize("value", [0, GEN, 3*GEN])
def test_creation_rejects_wrong_value_without_accounting(council, value):
    c, vm, actors = council
    before = state(c)
    vm.value = value
    with vm.expect_revert("2 GEN"):
        c.create_round("beta", "Other council", "Choose other permission.", actors[1].as_hex, actors[2].as_hex, START+100, START+200, START+300)
    assert state(c) == before


def test_duplicate_creation_cannot_receive_second_purse(council):
    c, vm, actors = council
    before = state(c)
    vm.value = 2*GEN
    with vm.expect_revert("exists"):
        c.create_round("alpha", "Other", "Another bounded objective.", actors[1].as_hex, actors[2].as_hex, START+100, START+200, START+300)
    assert state(c) == before


@pytest.mark.parametrize("method", ["cancel_round", "recover_round"])
def test_recovery_wrong_caller_unchanged(council, method):
    c, vm, actors = council
    clock(vm, START if method == "cancel_round" else START+300)
    vm.sender = actors[1]
    before = state(c)
    with vm.expect_revert("sponsor"):
        getattr(c, method)("alpha")
    assert state(c) == before


@pytest.mark.parametrize("method,when", [("cancel_round",START), ("recover_round",START+300)])
def test_recovery_credit_once_and_reject_terminal(council, method, when):
    c, vm, actors = council
    clock(vm, when)
    getattr(c, method)("alpha")
    assert c.get_credit(actors[0].as_hex) == "2"
    before = state(c)
    with vm.expect_revert("terminal"):
        getattr(c, method)("alpha")
    assert state(c) == before
    assert c.get_credit(actors[0].as_hex) == "2"


def test_cancel_after_participation_rejects(council):
    c, vm, _ = council
    c.submit_motion("alpha", json.loads(c.get_round("alpha"))["configDigest"], "Permit archive reading; forbid redistribution.")
    before = state(c)
    with vm.expect_revert("participation"):
        c.cancel_round("alpha")
    assert state(c) == before


def test_review_incomplete_and_terminal_cannot_credit(council):
    c, vm, _ = council
    clock(vm, START+200)
    before = state(c)
    with vm.expect_revert("incomplete"):
        c.review_round("alpha")
    assert state(c) == before
    clock(vm, START+300)
    c.recover_round("alpha")
    before = state(c)
    with vm.expect_revert("terminal"):
        c.review_round("alpha")
    assert state(c) == before


def test_withdraw_other_owner_and_duplicate_cannot_debit(council, monkeypatch):
    c, vm, actors = council
    with vm.expect_revert("credit"):
        c.withdraw_credit()
    c.cancel_round("alpha")
    vm.sender = actors[1]
    before = state(c)
    with vm.expect_revert("credit"):
        c.withdraw_credit()
    assert state(c) == before
    vm.sender = actors[0]
    # Capture the external boundary; real native delivery is a network assertion.
    import sys
    module = sys.modules[type(object.__getattribute__(c,"_instance")).__module__]
    transfers = []
    class Recipient:
        def __init__(self, address): self.address=address
        def emit_transfer(self, value):
            assert c.get_credit(actors[0].as_hex) == "0"
            transfers.append((self.address.as_hex.lower(), value))
    monkeypatch.setattr(module, "_Recipient", Recipient)
    c.withdraw_credit()
    assert transfers == [(actors[0].as_hex.lower(),2*GEN)]
    assert json.loads(c.get_accounting())["withdrawnGEN"] == "2"
    before = state(c)
    with vm.expect_revert("credit"):
        c.withdraw_credit()
    assert state(c) == before


@pytest.mark.parametrize("method,boundary,offset,allowed", [
    ("submit_motion",100,-1,True),("submit_motion",100,0,False),("submit_motion",100,1,False),
    ("cancel_round",100,-1,True),("cancel_round",100,0,False),("cancel_round",100,1,False),
    ("recover_round",300,-1,False),("recover_round",300,0,True),("recover_round",300,1,True),
])
def test_clock_independent_of_stale_phase(council,method,boundary,offset,allowed):
    c,vm,_=council
    clock(vm,START+boundary+offset)
    before=state(c)
    args=("alpha",json.loads(c.get_round("alpha"))["configDigest"],"Permit archive reading; forbid redistribution.") if method=="submit_motion" else ("alpha",)
    if allowed:
        getattr(c,method)(*args)
    else:
        with vm.expect_revert("time"):
            getattr(c,method)(*args)
        assert state(c)==before
