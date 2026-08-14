#!/usr/bin/env python3
from __future__ import annotations
import argparse, hashlib, json, re
from dataclasses import dataclass
from pathlib import Path
HERE=Path(__file__).resolve().parent; REPO=HERE.parents[2]; SOURCE=REPO/'src/content/items/item-visual-data.ts'; OUT=HERE/'render-jobs'
@dataclass(frozen=True)
class Job:
    job_id:str; output:str; markdown:Path; frames:int; columns:int; rows:int; cell:int; title:str; brief:str; references:tuple[str,...]
def digest(path:Path)->str: return hashlib.sha256(path.read_bytes()).hexdigest()
def friendly(value:str)->str: return value.replace('_',' ').title()
def jobs():
    text=SOURCE.read_text(); item_ids=re.findall(r'^\s{2}([a-z0-9_]+):\s*sheetVisual\(',text,re.M); custom=text[text.index('CUSTOM_BODY_POSE_SPRITES'):]; poses=re.findall(r"'([^']+\.png)'",custom); refs=('assets/sprites/items/icons-1.png','assets/sprites/items/icons-2.png'); result=[]
    for item_id in sorted(set(item_ids)):
        start=text.index(f'  {item_id}: sheetVisual('); tail=text[start:]; nxt=re.search(r'\n  [a-z0-9_]+: sheetVisual\(',tail[1:]); block=tail[:nxt.start()+1 if nxt else len(tail)]; kind=re.search(r"kind: '([^']+)'",block); vfx=re.search(r"vfxId: '([^']+)'",block); brief=f"A production overlay for {friendly(item_id)}; rendering kind {kind.group(1) if kind else 'equipment_overlay'}"; brief += f", with restrained {friendly(vfx.group(1))} impact language" if vfx else ''; result.append(Job(f'item_overlay__{item_id}',f'assets/sprites/items/{item_id}.png',OUT/'overlays'/f'{item_id}.md',8,4,2,96,friendly(item_id),brief+'.',refs))
    for filename in sorted(set(poses)):
        stem=Path(filename).stem; result.append(Job(f'item_body_pose__{stem}',f'assets/sprites/items/{filename}',OUT/'body-poses'/f'{stem}.md',1,1,1,256,friendly(stem),f'A reusable full-body equipment pose template for {friendly(stem)}. Preserve the Ethic Brawl side-view fighter proportions while making grip, weight, recoil, and silhouette mechanically unambiguous.',refs+('assets/sprites/roster/camus/source/camus_core_4x4.png',)))
    return result
def render(job:Job)->str:
    status='rendered_unreviewed' if (REPO/job.output).is_file() else 'pending_render'; width=job.columns*job.cell; height=job.rows*job.cell; refs='\n'.join(f'  - {json.dumps(x)}' for x in job.references)
    if job.frames==8: layout='Frames 1-4: held/idle, windup, active use, recovery. Frames 5-8: world pickup, thrown or fired state, impact/empty state, clean icon pose.'; subject='Draw the equipment only, with no fighter body. Keep the grip point stable and the object fully inside every cell.'
    else: layout='One complete side-view pose in the single cell, centered on the same root and baseline used by 256 px fighter frames.'; subject='Draw a neutral modular fighter silhouette plus the named equipment interaction; no recognizable philosopher identity, text, scenery, or UI.'
    prompt=f"Create EXACTLY one {width}x{height} RGBA pixel-art image arranged as a {job.columns}x{job.rows} grid with {job.frames} equal {job.cell}x{job.cell} cells, row-major.\n\nTARGET: {job.title}.\n{job.brief}\n{subject}\n{layout}\n\nUse true alpha transparency, crisp limited-palette pixel art, stable scale and lighting, no gutters, no labels, no checkerboard, no anti-aliased matte fringe, and no marks crossing cell boundaries. Every required cell must be occupied and meaningfully distinct. Keep glow and particles entirely inside the cell."
    return f'''---\ngenerated: true\ngenerated_by: "docs/prompts/item-sprites/render-prompts.py"\njob_id: {json.dumps(job.job_id)}\nstatus: {status}\noutput_image: {json.dumps(job.output)}\nframes: {job.frames}\ngrid:\n  columns: {job.columns}\n  rows: {job.rows}\ncell_size: [{job.cell}, {job.cell}]\noutput_size: [{width}, {height}]\nreference_images:\n{refs}\nsource_definition: "src/content/items/item-visual-data.ts"\nsource_sha256: {json.dumps(digest(SOURCE))}\n---\n\n# {job.title} — `{job.job_id}`\n\n## Prompt\n\n```text\n{prompt}\n```\n\n## Acceptance\n\nThe real PNG must pass `pnpm assets:audit`, then receive manual contact-sheet and in-engine review. A prompt file or placeholder is never completion.\n'''
def expected():
    js=jobs(); files={j.markdown:render(j) for j in js}; manifest={'schemaVersion':1,'source':'src/content/items/item-visual-data.ts','sourceSha256':digest(SOURCE),'jobs':[{'jobId':j.job_id,'outputImage':j.output,'markdown':j.markdown.relative_to(OUT).as_posix(),'frames':j.frames,'grid':{'columns':j.columns,'rows':j.rows},'cellSize':[j.cell,j.cell]} for j in js]}; files[OUT/'manifest.json']=json.dumps(manifest,indent=2,sort_keys=True)+'\n'; rows=['| Job | Prompt | Output |','|---|---|---|']+[f'| `{j.job_id}` | [`{j.markdown.relative_to(OUT).as_posix()}`]({j.markdown.relative_to(OUT).as_posix()}) | `{j.output}` |' for j in js]; files[OUT/'INDEX.md']=f"# Item Sprite Render Jobs\n\n- Total jobs: {len(js)}\n- Overlay sheets: {sum(j.frames==8 for j in js)}\n- Body-pose templates: {sum(j.frames==1 for j in js)}\n\n"+'\n'.join(rows)+'\n'; return files
def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--check',action='store_true'); args=ap.parse_args(); files=expected()
    if args.check:
        problems=[f"missing/outdated: {p.relative_to(REPO)}" for p,c in files.items() if not p.is_file() or p.read_text()!=c]; print('\n'.join(problems) if problems else f'Verified {len(files)-2} item sprite render jobs.'); return 1 if problems else 0
    for p,c in files.items(): p.parent.mkdir(parents=True,exist_ok=True); p.write_text(c)
    print(f'Generated {len(files)-2} item sprite render jobs.'); return 0
if __name__=='__main__': raise SystemExit(main())
