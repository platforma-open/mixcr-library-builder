import { BlockModel, InferOutputsType, ImportFileHandle, parseResourceMap } from '@platforma-sdk/model';

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

  .argsValid(
    (ctx) =>
      ctx.args.species !== undefined &&
      (ctx.args.vSpecies !== undefined || ctx.args.vFastaFile !== undefined) &&
      (ctx.args.jSpecies !== undefined || ctx.args.jFastaFile !== undefined) 
)

  .output('debugOutput', (ctx) => ctx.outputs?.resolve('debugOutput')?.getLogHandle())

  .sections([{ type: 'link', href: '/', label: 'Main' }])

  .done();

export type BlockOutputs = InferOutputsType<typeof model>;
