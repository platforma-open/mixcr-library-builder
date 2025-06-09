#!/usr/bin/env python3
import json
import glob
import argparse
import sys

def main():
    parser = argparse.ArgumentParser(
        description="Merge immunological-gene JSON files: keep header from first file, concatenate all genes & sequenceFragments"
    )
    parser.add_argument(
        "-i", "--inputs",
        nargs="+",
        required=True,
        help="Input JSON files or glob patterns (e.g. '*.json')"
    )
    parser.add_argument(
        "-o", "--output",
        default="merged.json",
        help="Output filename (default: merged.json)"
    )
    args = parser.parse_args()

    # Expand any glob patterns
    files = []
    for pattern in args.inputs:
        matched = glob.glob(pattern)
        if not matched:
            print(f"Warning: no files match '{pattern}'", file=sys.stderr)
        files.extend(matched)
    if not files:
        print("Error: no input files found.", file=sys.stderr)
        sys.exit(1)

    # Load first file to get the header
    with open(files[0]) as f:
        data0 = json.load(f)
    if not isinstance(data0, list) or not data0:
        print(f"Error: {files[0]} does not contain a non-empty JSON array.", file=sys.stderr)
        sys.exit(1)
    header = data0[0].copy() # This is the object that will form the basis of the merged data

    # Prepare accumulators
    all_genes = []
    all_frags = []

    # Iterate through every file and every object in its top-level array
    for fname in files:
        with open(fname) as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError as e:
                print(f"Warning: could not decode JSON from {fname}. Error: {e}", file=sys.stderr)
                continue
        if not isinstance(data, list):
            print(f"Warning: {fname} skipped (not a JSON array)", file=sys.stderr)
            continue
        for entry in data:
            if not isinstance(entry, dict):
                print(f"Warning: item in {fname} is not an object, skipped.", file=sys.stderr)
                continue
            # Merge genes
            genes = entry.get("genes")
            if isinstance(genes, list):
                all_genes.extend(genes)
            # Merge sequenceFragments if present
            frags = entry.get("sequenceFragments")
            if isinstance(frags, list):
                all_frags.extend(frags)

    # Build the single merged object
    merged_object = header
    merged_object["genes"] = all_genes
    if all_frags: # Only add sequenceFragments key if there are fragments
        merged_object["sequenceFragments"] = all_frags
    # If the example structure implies sequenceFragments should always exist,
    # even if empty, and it's not guaranteed to be in the header, you might add:
    # elif "sequenceFragments" not in merged_object:
    #     merged_object["sequenceFragments"] = []


    # Write it out - the final output is a list containing the merged_object
    with open(args.output, "w") as f:
        json.dump([merged_object], f, indent=2) # <--- MODIFIED LINE
    print(f"Written merged file to {args.output}")

if __name__ == "__main__":
    main()