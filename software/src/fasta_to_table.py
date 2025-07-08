#!/usr/bin/env python3
#!/usr/bin/env python3
import os
import glob
import pandas as pd
import textwrap
import re

# Standard codon table (DNA codons -> 1‐letter amino acids)
CODON_TABLE = {
    # Phenylalanine
    'TTT':'F','TTC':'F',
    # Leucine
    'TTA':'L','TTG':'L','CTT':'L','CTC':'L','CTA':'L','CTG':'L',
    # Isoleucine
    'ATT':'I','ATC':'I','ATA':'I',
    # Methionine (start)
    'ATG':'M',
    # Valine
    'GTT':'V','GTC':'V','GTA':'V','GTG':'V',
    # Serine
    'TCT':'S','TCC':'S','TCA':'S','TCG':'S','AGT':'S','AGC':'S',
    # Proline
    'CCT':'P','CCC':'P','CCA':'P','CCG':'P',
    # Threonine
    'ACT':'T','ACC':'T','ACA':'T','ACG':'T',
    # Alanine
    'GCT':'A','GCC':'A','GCA':'A','GCG':'A',
    # Tyrosine
    'TAT':'Y','TAC':'Y',
    # Histidine
    'CAT':'H','CAC':'H',
    # Glutamine
    'CAA':'Q','CAG':'Q',
    # Asparagine
    'AAT':'N','AAC':'N',
    # Lysine
    'AAA':'K','AAG':'K',
    # Aspartic Acid
    'GAT':'D','GAC':'D',
    # Glutamic Acid
    'GAA':'E','GAG':'E',
    # Cysteine
    'TGT':'C','TGC':'C',
    # Tryptophan
    'TGG':'W',
    # Arginine
    'CGT':'R','CGC':'R','CGA':'R','CGG':'R','AGA':'R','AGG':'R',
    # Glycine
    'GGT':'G','GGC':'G','GGA':'G','GGG':'G',
    # Stop codons
    'TAA':'*','TAG':'*','TGA':'*'
}

def translate_seq(nt_seq: str, start_offset: int = 0) -> str:
    """Translate a nucleotide sequence into amino acids. 
       Trims trailing bases if not a multiple of 3.
       start_offset: number of nucleotides to skip before starting translation (0-based)."""
    seq = nt_seq.upper().replace('\n','').replace(' ','')
    
    # Apply start offset
    if start_offset > 0:
        seq = seq[start_offset:]
    
    codons = textwrap.wrap(seq, 3)
    aa = []
    for c in codons:
        if len(c) < 3:
            break
        aa.append(CODON_TABLE.get(c, 'X'))  # unknown codons -> X
    return ''.join(aa)

def translate_all_frames(nt_seq: str) -> list:
    """Translate a nucleotide sequence in all three reading frames."""
    seq = nt_seq.upper().replace('\n','').replace(' ','')
    translations = []
    
    for frame in range(3):
        frame_seq = seq[frame:]
        codons = textwrap.wrap(frame_seq, 3)
        aa = []
        for c in codons:
            if len(c) < 3:
                break
            aa.append(CODON_TABLE.get(c, 'X'))
        translations.append(''.join(aa))
    
    return translations

def find_gxg_translation(translations: list) -> str:
    """Find the translation that contains (FG|WG)[A-Z]G pattern and return it.
       If no pattern found, return the first translation."""
    j_pattern = re.compile(r'(?:FG|WG)[A-Z]G')  # FG or WG, followed by any amino acid, followed by G
    
    for translation in translations:
        if j_pattern.search(translation):
            return translation
    
    # If no pattern found, return the first translation
    return translations[0] if translations else ""

def parse_fasta(path):
    """Yield (gene_name, sequence) pairs from a FASTA file.
       Gene name is extracted as the first field of the header (delimited by '|')."""
    header = None
    seq_lines = []
    with open(path) as f:
        for line in f:
            line = line.rstrip()
            if line.startswith('>'):
                if header:
                    # Extract gene name from the first field of the header
                    gene_name = header.split('|')[0] if '|' in header else header
                    yield gene_name, ''.join(seq_lines)
                header = line[1:]  # Remove the '>' prefix
                seq_lines = []
            else:
                seq_lines.append(line)
        if header:
            # Extract gene name from the first field of the header
            gene_name = header.split('|')[0] if '|' in header else header
            yield gene_name, ''.join(seq_lines)

def main(input_dir):
    # find all .fasta files
    fasta_files = glob.glob(os.path.join(input_dir, '*.fasta'))
    # collect all data in one list
    all_records = []
    
    for fp in fasta_files:
        # expect filename like SEGMENT_CHAIN.fasta
        fname = os.path.basename(fp)
        try:
            segment, chain_ext = fname.split('_', 1)
            chain = chain_ext.rsplit('.',1)[0]
        except ValueError:
            print(f"Skipping unrecognized filename format: {fname}")
            continue

        # parse each record in the file
        for gene_name, nuc in parse_fasta(fp):
            if segment == "J":
                # For J genes: translate in all frames and select the one with (FG|WG)[A-Z]G pattern
                translations = translate_all_frames(nuc)
                selected_translation = find_gxg_translation(translations)
                sequence = selected_translation
            elif segment == "V":
                # For V genes: translate in frame 0
                sequence = translate_seq(nuc)
            else:
                # For other genes: translate in frame 0
                sequence = translate_seq(nuc)
            
            all_records.append({
                'chain': chain,
                'segment': segment,
                'gene_name': gene_name,
                'sequence': sequence
            })

    # Create combined DataFrame and save
    if all_records:
        df = pd.DataFrame(all_records, columns=['chain', 'segment', 'gene_name', 'sequence'])
        out_fn = "combined_table.tsv"
        df.to_csv(out_fn, index=False, sep='\t')
        print(f"Wrote {len(df)} entries to {out_fn}")
    else:
        print("No records found to write to table")

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(
        description="Parse FASTA files and generate per-chain translation tables."
    )
    parser.add_argument('input_dir', help="Directory containing *.fasta files")
    args = parser.parse_args()
    main(args.input_dir)
