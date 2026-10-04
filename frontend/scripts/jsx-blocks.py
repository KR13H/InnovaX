"""Helpers for trimming blocks out of the generated Stitch screens.

block_after(lines, marker): (start, end) line indices of the JSX element that follows a
`{/* marker */}` comment line, using indentation to find its closing tag.
"""


def block_after(lines, marker):
    i = next(k for k, l in enumerate(lines) if marker in l and "{/*" in l)
    j = i + 1
    while lines[j].strip() == '{" "}':  # whitespace markers emitted by the converter
        j += 1
    first = lines[j]
    indent = first[: len(first) - len(first.lstrip())]
    tag = first.lstrip().split()[0].lstrip("<").rstrip(">")
    if first.rstrip().endswith("/>"):
        return i, j
    k = next(n for n in range(j + 1, len(lines)) if lines[n] == f"{indent}</{tag}>")
    return i, k


def remove(lines, marker):
    i, k = block_after(lines, marker)
    del lines[i : k + 1]


def wrap(lines, marker, condition):
    """Render the block only when `condition` (a JSX expression) is truthy."""
    i, k = block_after(lines, marker)
    indent = lines[i][: len(lines[i]) - len(lines[i].lstrip())]
    lines[k] = lines[k] + "\n" + indent + ")}"
    lines[i] = lines[i] + "\n" + indent + "{" + condition + " && ("
