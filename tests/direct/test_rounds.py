import json
import pytest

GEN = 10**18


def test_initial_accounting_is_zero_gen(direct_deploy):
    contract = direct_deploy()
    assert json.loads(contract.get_accounting()) == {
        "receivedGEN": "0", "escrowGEN": "0", "creditGEN": "0", "withdrawnGEN": "0"
    }


def test_create_round_records_exact_two_gen_and_named_members(direct_deploy, direct_vm, direct_alice, direct_bob, direct_charlie):
    contract = direct_deploy()
    direct_vm.sender = direct_alice
    direct_vm.value = 2 * GEN
    import genlayer as gl
    from datetime import datetime
    now = int(datetime.fromisoformat(gl.message.raw["datetime"].replace("Z", "+00:00")).timestamp())
    contract.create_round("alpha", "Archive council", "Choose the bounded archive permission to fund.", direct_bob.as_hex, direct_charlie.as_hex, now+100, now+200, now+300)
    state = json.loads(contract.get_round("alpha"))
    assert state["members"] == [direct_alice.as_hex.lower(), direct_bob.as_hex.lower(), direct_charlie.as_hex.lower()]
    assert json.loads(contract.get_accounting())["escrowGEN"] == "2"
