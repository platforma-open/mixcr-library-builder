import { BlockModel, InferOutputsType, ImportFileHandle } from '@platforma-sdk/model';

export type BlockArgs = {
  species: string;
  taxonId: string;
  chain: "TRB" | "TRA" | "TRD" | "TRG" | "IGH" | "IGK" | "IGL";
  vFastaFile?: ImportFileHandle;
  jFastaFile?: ImportFileHandle;
  dFastaFile?: ImportFileHandle;
  cFastaFile?: ImportFileHandle;
  vSpecies?: "hsa" | "mmu" | "alpaca" | "lama" | "mfas";
  jSpecies?: "hsa" | "mmu" | "alpaca" | "lama" | "mfas";
  dSpecies?: "hsa" | "mmu" | "alpaca" | "lama" | "mfas";
  cSpecies?: "hsa" | "mmu" | "alpaca" | "lama" | "mfas";
};

export const model = BlockModel.create()

  .withArgs<BlockArgs>({
    species: "",
    taxonId: "",
    chain: "TRB",
  })

  .output('debugOutput', (ctx) => ctx.outputs?.resolve('debugOutput')?.getRemoteFileHandle())

  .sections([{ type: 'link', href: '/', label: 'Main' }])

  .done();

export type BlockOutputs = InferOutputsType<typeof model>;
