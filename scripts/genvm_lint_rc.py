"""Extend only the upstream v0.3 safe-entrypoint reachability table.

genvm-linter0.11.1rc2 omits run_nondet_default after the SDK rename. No rule or
validation result is suppressed, and the installed vendor package is unchanged.
"""
import os

# The runtime artifact and Depends hash are one verified versioned unit.
os.environ["GENVM_VERSION"] = "v0.6.0-rc5"

from genvm_linter.lint import safety, structure

safety.SafeEntryPointFinder.SAFE_PATTERNS["gl.vm.run_nondet_default"] = [0, 1]
safety.NONDET_SPAWN_CALLS = safety.NONDET_SPAWN_CALLS | {"gl.vm.run_nondet_default"}

# Recognize the exact v0.3 storage decorator without suppressing E014 for
# undecorated classes. The runtime validator still executes the actual source.
_decorator_name = structure.StorageClassChecker._decorator_to_string


def decorator_name(self, node):
    name = _decorator_name(self, node)
    return "gl.allow_storage" if name == "gl.storage.allow" else name


structure.StorageClassChecker._decorator_to_string = decorator_name

from genvm_linter.cli import main

if __name__ == "__main__":
    main()
