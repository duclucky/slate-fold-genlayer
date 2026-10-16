import ast
from pathlib import Path
import importlib.util

ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT/"contracts/slate_fold.py"


def test_ascii_pinned_header_and_single_visible_contract():
    source=SOURCE.read_text(encoding="ascii")
    assert source.splitlines()[:2]==['# v0.3.0','# { "Depends": "py-genlayer:5jycge4q8k23462jtb0b9fyey1s9qz928sz2nbrd9mg4sxqg2qng" }']
    tree=ast.parse(source)
    contracts=[n for n in tree.body if isinstance(n,ast.ClassDef) and any(ast.unparse(b)=="gl.contract.Contract" for b in n.bases)]
    assert [c.name for c in contracts]==["SlateFoldContract"]
    assert "gl.chain.Account" not in source and "run_nondet_unsafe" not in source


def test_exact_public_surface_payability_and_storage():
    tree=ast.parse(SOURCE.read_text())
    contract=next(n for n in tree.body if isinstance(n,ast.ClassDef) and n.name=="SlateFoldContract")
    writes={n.name:[ast.unparse(d) for d in n.decorator_list] for n in contract.body if isinstance(n,ast.FunctionDef) and any('gl.public.write' in ast.unparse(d) for d in n.decorator_list)}
    assert set(writes)=={'create_round','submit_motion','cast_ballot','review_round','cancel_round','recover_round','withdraw_credit'}
    assert [name for name,decs in writes.items() if 'gl.public.write.payable' in decs]==['create_round']
    for node in ast.walk(tree):
        if isinstance(node,ast.AnnAssign): assert ast.unparse(node.annotation) not in ('int','float','dict','list')
    assert sum(isinstance(n,ast.Call) and ast.unparse(n.func)=='gl.vm.run_nondet_default' for n in ast.walk(tree))==1


def test_real_runtime_decorators_match_payability(direct_deploy):
    c=direct_deploy()
    inst=object.__getattribute__(c,'_instance')
    assert getattr(type(inst).create_round,'__gl_payable__',False)
    for name in ['submit_motion','cast_ballot','review_round','cancel_round','recover_round','withdraw_credit']:
        assert not getattr(getattr(type(inst),name),'__gl_payable__',False)


def test_v03_linter_compat_does_not_hide_missing_storage_decorator():
    spec=importlib.util.spec_from_file_location('slate_lint',ROOT/'scripts/genvm_lint_rc.py')
    module=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    from genvm_linter.lint.structure import check_structure
    valid='''import genlayer as gl\nfrom dataclasses import dataclass\nfrom genlayer.storage import TreeMap\n@gl.storage.allow\n@dataclass\nclass Item:\n value: str\nclass Specific(gl.contract.Contract):\n items: TreeMap[str, Item]\n'''
    assert not any(x.code=='E014' for x in check_structure(valid))
    assert any(x.code=='E014' for x in check_structure(valid.replace('@gl.storage.allow\n','')))
