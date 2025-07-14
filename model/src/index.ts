import { BlockModel, InferOutputsType, parseResourceMap, createPlDataTableV2, PlDataTableStateV2, createPlDataTableStateV2, createPlDataTableSheet, getUniquePartitionKeys } from '@platforma-sdk/model';
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
  fivePrimePrimer?: undefined;
  chainConfigs: Record<string, {
    V: VSegmentConfig;
    D?: BaseSegmentConfig;
    J: BaseSegmentConfig;
    C?: BaseSegmentConfig;
  }>;
};

export type UiState = {
  tableState: PlDataTableStateV2;
};

export const model = BlockModel.create()

  .withArgs<BlockArgs>({
    species: "",
    chains: ["IGH"],
    chainConfigs: {},
  })

  .withUiState<UiState>({
    tableState: createPlDataTableStateV2(),
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

  .output('availableChains', (ctx) => {
    const pCols = ctx.outputs?.resolve('fastaTable')?.getPColumns();
    if (pCols === undefined || pCols.length === 0) {
      return [];
    }

    // Get unique chain values from the first column's first axis (assuming chain is the first axis)
    const firstColumn = pCols[0];
    const chainValues = getUniquePartitionKeys(firstColumn.data)?.[0];
    return chainValues || [];
  })

  .output('chainOptions', (ctx) => {
    const pCols = ctx.outputs?.resolve('fastaTable')?.getPColumns();
    if (pCols === undefined || pCols.length === 0) {
      return [];
    }

    // Get unique chain values from the data
    const firstColumn = pCols[0];
    const chainValues = getUniquePartitionKeys(firstColumn.data)?.[0];
    
    if (!chainValues) {
      return [];
    }

    return chainValues.map(chain => ({
      value: chain,
      label: chain
    }));
  })

  .output('chainTableSheets', (ctx) => {
    const pCols = ctx.outputs?.resolve('fastaTable')?.getPColumns();
    if (pCols === undefined || pCols.length === 0) {
      return undefined;
    }

    const firstColumn = pCols[0];
    const chainValues = getUniquePartitionKeys(firstColumn.data)?.[0];
    if (!chainValues) {
      return undefined;
    }

    // Create table sheets for each chain (this helps with filtering)
    return [createPlDataTableSheet(ctx, firstColumn.spec.axesSpec[0], chainValues)];
  })

  .output('fastaTable', (ctx) => {
    const pCols = ctx.outputs?.resolve('fastaTable')?.getPColumns();
    if (pCols === undefined) {
      return undefined;
    }

    return createPlDataTableV2(ctx, pCols, ctx.uiState?.tableState || createPlDataTableStateV2());
  })



  .output('isRunning', (ctx) => ctx.outputs?.getIsReadyOrError() === false)

  
  .title((ctx) => {
    const libraryName = ctx.args.species;
    return libraryName ? `MiXCR Library Builder - ${libraryName} library` : 'MiXCR Library Builder';
  })

  .sections([
    { type: 'link', href: '/', label: 'Library Builder' }
  ])

  .done();

export type BlockOutputs = InferOutputsType<typeof model>;
