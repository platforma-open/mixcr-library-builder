import { BlockModel, InferOutputsType } from '@platforma-sdk/model';
import { ImportFileHandle } from '@platforma-sdk/model';

type VRegionType = 'VTranscript' | 'VRegion';

type BaseSegmentConfig = {
  sourceType: 'built-in' | 'fasta'
  builtInSpecies: string | undefined      // only if sourceType==='built-in'
  fastaFile: ImportFileHandle | undefined     // only if sourceType==='fasta'
}

type VSegmentConfig = BaseSegmentConfig & {
  vRegionType: VRegionType     // only used when sourceType==='fasta'
}

type SegmentConfig = BaseSegmentConfig | VSegmentConfig;

export type BlockArgs = {
  species: string;
  chains: string[];
  chainConfigs: Record<string, {
    V: VSegmentConfig;
    D?: BaseSegmentConfig;
    J: BaseSegmentConfig;
    C?: BaseSegmentConfig;
  }>;
};

export const model = BlockModel.create()

  .withArgs<BlockArgs>({
    species: "",
    chains: ["IGH"],
    chainConfigs: {},
  })

  // .argsValid(
  //   (ctx) =>
  //     ctx.args.species !== undefined &&
  //     (ctx.args.vSpecies !== undefined || ctx.args.vFastaFile !== undefined) &&
  //     (ctx.args.jSpecies !== undefined || ctx.args.jFastaFile !== undefined) 
  // )

  .output(
    'fileImports',
    (ctx) =>
      Object.fromEntries(
        ctx.outputs
          ?.resolve({ field: 'fileImports', assertFieldType: 'Input' , allowPermanentAbsence: true})
          ?.mapFields((handle, acc) => [handle as ImportFileHandle, acc.getImportProgress()], {
            skipUnresolved: true,
          }) ?? []
      ),
    { isActive: true }
  )

  .output('debugOutput', (ctx) => ctx.outputs?.resolve('debugOutput')?.getLogHandle())

  .sections([{ type: 'link', href: '/', label: 'Main' }])

  .done();

export type BlockOutputs = InferOutputsType<typeof model>;
