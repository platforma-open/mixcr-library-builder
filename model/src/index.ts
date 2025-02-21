import { BlockModel, InferOutputsType, ImportFileHandle } from '@platforma-sdk/model';

export type BlockArgs = {
  species: string;
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
    chain: "TRB",
  })

  .argsValid(
    (ctx) =>
      ctx.args.species !== undefined &&
      (ctx.args.vSpecies !== undefined || ctx.args.vFastaFile !== undefined) &&
      (ctx.args.jSpecies !== undefined || ctx.args.jFastaFile !== undefined) 
  )

  .output('vUploadProgress', (ctx) => ctx.args.vFastaFile ? ctx.outputs?.resolve('vImportHandle')?.getImportProgress() : undefined)

  .output('jUploadProgress', (ctx) => ctx.args.jFastaFile ? ctx.outputs?.resolve('jImportHandle')?.getImportProgress() : undefined)

  .output('dUploadProgress', (ctx) => ctx.args.dFastaFile ? ctx.outputs?.resolve('dImportHandle')?.getImportProgress() : undefined)

  .output('cUploadProgress', (ctx) => ctx.args.cFastaFile ? ctx.outputs?.resolve('cImportHandle')?.getImportProgress() : undefined)

  .output('debugOutput', (ctx) => ctx.outputs?.resolve('debugOutput')?.getLogHandle())

  .sections([{ type: 'link', href: '/', label: 'Main' }])

  .done();

export type BlockOutputs = InferOutputsType<typeof model>;
