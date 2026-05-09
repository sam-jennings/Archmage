
import cairosvg, pathlib, sys
try:
    import pypdf
except Exception:
    pypdf = None

svg_dir = pathlib.Path("C:\\Users\\sam.jennings\\OneDrive - Arrise Solutions Malta Limited\\Documents\\Archmage Ascension\\card-design\\export-cs3\\svg-cards")
pdf_dir = pathlib.Path("C:\\Users\\sam.jennings\\OneDrive - Arrise Solutions Malta Limited\\Documents\\Archmage Ascension\\card-design\\export-cs3\\pdf-cards")
expected_w_mm = 68
expected_h_mm = 94
pdf_dir.mkdir(exist_ok=True)
svgs = sorted(svg_dir.glob('*.svg'))
errors = []
checked = 0

def pt_to_mm(pt):
    return pt * 25.4 / 72.0

for i, svg in enumerate(svgs):
    out = pdf_dir / (svg.stem + '.pdf')
    try:
        # The SVG root declares width/height in mm and an exact-ratio
        # viewBox. CairoSVG should therefore write the right page size directly.
        cairosvg.svg2pdf(url=str(svg), write_to=str(out), dpi=300)

        # When pypdf is available, forcibly normalise all PDF page boxes as a
        # second guard against viewer/toolchain defaults. This prevents A4/Letter
        # media boxes or stale crop boxes from surviving the conversion.
        if pypdf is not None:
            reader = pypdf.PdfReader(str(out))
            page = reader.pages[0]
            expected_w_pt = expected_w_mm * 72.0 / 25.4
            expected_h_pt = expected_h_mm * 72.0 / 25.4
            for box_name in ('mediabox', 'cropbox', 'trimbox', 'artbox'):
                box = getattr(page, box_name)
                box.lower_left = (0, 0)
                box.upper_right = (expected_w_pt, expected_h_pt)
            if expected_w_mm > 0 and expected_h_mm > 0:
                page.bleedbox.lower_left = (0, 0)
                page.bleedbox.upper_right = (expected_w_pt, expected_h_pt)
            writer = pypdf.PdfWriter()
            writer.add_page(page)
            with open(out, 'wb') as fh:
                writer.write(fh)

            page = pypdf.PdfReader(str(out)).pages[0]
            w_mm = pt_to_mm(float(page.mediabox.width))
            h_mm = pt_to_mm(float(page.mediabox.height))
            checked += 1
            if abs(w_mm - expected_w_mm) > 0.05 or abs(h_mm - expected_h_mm) > 0.05:
                errors.append(f'{svg.name}: PDF page is {w_mm:.2f} x {h_mm:.2f} mm, expected {expected_w_mm:.2f} x {expected_h_mm:.2f} mm')

        if (i+1) % 20 == 0:
            print(f'  {i+1}/{len(svgs)} done...')
    except Exception as e:
        errors.append(f'{svg.name}: {e}')

print(f'Done. {len(svgs)-len(errors)} PDFs written to pdf-cards/')
if checked:
    print(f'Verified PDF page size on {checked} file(s): {expected_w_mm:.2f} x {expected_h_mm:.2f} mm')
if errors:
    [print(' ', e) for e in errors]
    sys.exit(1)
