"""Review invariants and independent semantic replay, before review body."""
import hashlib
import json
import sys
import pytest
from test_lifecycle import council, clock, complete, state, START

REFERENCE = b"Permissions, prohibitions and duties: bounded test vocabulary."


@pytest.fixture
def ready(council, monkeypatch):
    c,vm,actors=council
    module=sys.modules[type(object.__getattribute__(c,"_instance")).__module__]
    # Synthetic policy bytes are confined to this direct-test process. Update
    # the synthetic round binding too; production pins the real W3C body.
    monkeypatch.setattr(module,"SOURCE_HASH",hashlib.sha256(REFERENCE).hexdigest())
    c.rounds["alpha"].config_digest=c._config(c.rounds["alpha"])
    complete(c,vm,actors)
    vm.mock_web(r"www\.w3\.org/",{"status":200,"body":REFERENCE})
    return c,vm,actors,module


def output(vm, value):
    vm.mock_llm(r".*",json.dumps(value) if not isinstance(value,str) else value)


@pytest.mark.parametrize("verdict",[
    {},{"12":"SAME","13":"DIFFERENT"},
    {"12":"SAME","13":"SAME","23":"DIFFERENT"},
    {"12":"SAME","13":"DIFFERENT","23":"DIFFERENT","winner":1},
    {"12":"ROOT","13":"BLOCKED","23":"DIFFERENT"},
    {"12":"SAME","13":"DOWNSTREAM","23":"DIFFERENT"},
    '{"12":"SAME","12":"DIFFERENT","13":"DIFFERENT","23":"DIFFERENT"}',
    "not JSON", ["SAME","DIFFERENT","DIFFERENT"],
])
def test_invalid_settlement_meaning_reverts_before_mutation(ready,verdict):
    c,vm,_,_=ready
    before=state(c)
    output(vm,verdict)
    with vm.expect_revert("[EXPECTED]"): c.review_round("alpha")
    assert state(c)==before


@pytest.mark.parametrize("classes,expected,groups",[
    ({"12":"SAME","13":"DIFFERENT","23":"DIFFERENT"},"ELECTED",[[1,2],[3]]),
    ({"12":"DIFFERENT","13":"DIFFERENT","23":"DIFFERENT"},"REFUNDED",[[1],[2],[3]]),
    ({"12":"SAME","13":"SAME","23":"SAME"},"ELECTED",[[1,2,3]]),
])
def test_review_derives_group_majority_and_credit_once(ready,classes,expected,groups):
    c,vm,actors,_=ready
    output(vm,classes)
    c.review_round("alpha")
    r=json.loads(c.get_round("alpha"))
    assert r["status"]==expected and r["groups"]==groups
    assert sum(r["scores"])==3
    assert r["recipient"]==actors[0].as_hex.lower()
    assert c.get_credit(actors[0].as_hex)=="2"
    assert json.loads(c.get_accounting())=={"receivedGEN":"2","escrowGEN":"0","creditGEN":"2","withdrawnGEN":"0"}
    before=state(c)
    with vm.expect_revert("terminal"): c.review_round("alpha")
    assert state(c)==before


def test_unclear_keeps_purse_then_recovers_at_expiry(ready):
    c,vm,actors,_=ready
    output(vm,{"12":"UNCLEAR","13":"DIFFERENT","23":"DIFFERENT"})
    before=c.get_accounting()
    c.review_round("alpha")
    assert json.loads(c.get_round("alpha"))["status"]=="RETRYABLE"
    assert c.get_accounting()==before and c.get_credit(actors[0].as_hex)=="0"
    clock(vm,START+300)
    vm.sender=actors[0]
    c.recover_round("alpha")
    assert c.get_credit(actors[0].as_hex)=="2"


@pytest.mark.parametrize("source",[{"status":503,"body":b"outage"},{"status":200,"body":b"claimant-controlled but stable bytes"}])
def test_source_failure_and_valid_actor_hash_cannot_credit(ready,source):
    c,vm,actors,_=ready
    vm.clear_mocks()
    vm.mock_web(r"www\.w3\.org/",source)
    # No LLM mock: reaching judgment is itself an error.
    before=c.get_accounting()
    c.review_round("alpha")
    assert c.get_accounting()==before
    assert c.get_credit(actors[0].as_hex)=="0"
    assert json.loads(c.get_round("alpha"))["status"]=="RETRYABLE"


@pytest.mark.parametrize("field,value",[("actor","0x"+"ab"*20),("round_id","other"),("slot",2),("config_digest","f"*64),("submitted_at",START+100)])
def test_hash_valid_motion_wrong_authority_binding_cannot_settle(ready,field,value):
    c,vm,_,module=ready
    m=c.motions["alpha:1"]
    setattr(m,field,value)
    # Interested party can hash its own bytes; this never repairs authority.
    m.digest=module._digest([m.round_id,int(m.slot),m.actor,m.config_digest,m.text])
    before=state(c)
    with vm.expect_revert("binding"): c.review_round("alpha")
    assert state(c)==before


@pytest.mark.parametrize("edge,offset,allowed",[(200,-1,False),(200,0,True),(200,1,True),(300,-1,True),(300,0,False),(300,1,False)])
def test_review_checks_clock_with_phase_ready(ready,edge,offset,allowed):
    c,vm,_,_=ready
    output(vm,{"12":"DIFFERENT","13":"DIFFERENT","23":"DIFFERENT"})
    clock(vm,START+edge+offset)
    before=state(c)
    if allowed: c.review_round("alpha")
    else:
        with vm.expect_revert("time"): c.review_round("alpha")
        assert state(c)==before


@pytest.mark.parametrize("wrapper",["```json\n{}\n```","```\n{}\n```","  ```JSON\n{}\n```  ","```json\r\n{}\r\n```"])
def test_json_transport_fence_preserves_exact_semantic_classes(ready,wrapper):
    c,vm,_,_=ready
    raw=json.dumps({"12":"SAME","13":"DIFFERENT","23":"DIFFERENT"})
    output(vm,wrapper.format(raw))
    c.review_round("alpha")
    assert json.loads(c.get_round("alpha"))["groups"]==[[1,2],[3]]
    assert json.loads(c.get_accounting())["creditGEN"]=="2"


@pytest.mark.parametrize("raw",[
    'Explanation: ```json\n{"12":"SAME","13":"DIFFERENT","23":"DIFFERENT"}\n```',
    '```json\n{"12":"SAME","13":"DIFFERENT","23":"DIFFERENT"}\n``` extra',
    '```json\n{"12":"SAME","12":"DIFFERENT","13":"DIFFERENT","23":"DIFFERENT"}\n```',
    '```json\n{"12":"SAME","13":"SAME","23":"DIFFERENT"}\n```',
    '```json\n{"12":"SAME","13":"DIFFERENT","23":"DIFFERENT","amountGEN":"2"}\n```',
    ' '*4100+'{"12":"SAME","13":"DIFFERENT","23":"DIFFERENT"}',
])
def test_transport_normalization_never_repairs_invalid_settlement_meaning(ready,raw):
    c,vm,_,_=ready
    before=state(c)
    output(vm,raw)
    with vm.expect_revert("[EXPECTED]"): c.review_round("alpha")
    assert state(c)==before


def test_validator_compares_meaning_across_plain_and_fenced_json(ready):
    c,vm,_,_=ready
    classes={"12":"SAME","13":"DIFFERENT","23":"DIFFERENT"}
    output(vm,classes)
    c.review_round("alpha")
    vm.clear_mocks()
    vm.mock_web(r"www\.w3\.org/",{"status":200,"body":REFERENCE})
    output(vm,"```json\n"+json.dumps(classes)+"\n```")
    assert vm.run_validator() is True
