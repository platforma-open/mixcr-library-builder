import { BlockModel, InferOutputsType, parseResourceMap } from '@platforma-sdk/model';
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

   .argsValid(
     (ctx) => {
       // Check that species is provided
       if (!ctx.args.species || ctx.args.species.trim() === '') {
         return false;
       }
       
       // Check that at least one chain is selected
       if (!ctx.args.chains || ctx.args.chains.length === 0) {
         return false;
       }
       
       // Check that each selected chain has valid V and J segment configurations
       for (const chain of ctx.args.chains) {
         const chainConfig = ctx.args.chainConfigs[chain];
         if (!chainConfig) {
           return false;
         }
         
         // V segment is required - must have either built-in species or fasta file
         const vConfig = chainConfig.V;
         if (!vConfig || 
             (vConfig.sourceType === 'built-in' && (!vConfig.builtInSpecies || vConfig.builtInSpecies.trim() === '')) ||
             (vConfig.sourceType === 'fasta' && !vConfig.fastaFile)) {
           return false;
         }
         
         // J segment is required - must have either built-in species or fasta file
         const jConfig = chainConfig.J;
         if (!jConfig || 
             (jConfig.sourceType === 'built-in' && (!jConfig.builtInSpecies || jConfig.builtInSpecies.trim() === '')) ||
             (jConfig.sourceType === 'fasta' && !jConfig.fastaFile)) {
           return false;
         }
       }
       
       return true;
     }
   )

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

  .output('debugOutput', (ctx) => {
    return ctx.outputs !== undefined
      ? parseResourceMap(ctx.outputs?.resolve('debugOutput'), (acc) => acc.getLogHandle(), false)
      : undefined;
  })

  .title((ctx) => {
    const libraryName = ctx.args.species;
    return libraryName ? `MiXCR Library Builder - ${libraryName} library` : 'MiXCR Library Builder';
  })

  .sections([{ type: 'link', href: '/', label: 'Main' }])

  .done();

export type BlockOutputs = InferOutputsType<typeof model>;
