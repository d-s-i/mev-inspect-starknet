import { defaultProvider } from "starknet";
import { EventAnalyzer } from "starknet-analyzer/lib/analyzers/EventAnalyzer";

const analyzeBlocks = async function(start: number, end: number) {

    const eventAnalyzer = new EventAnalyzer(defaultProvider);
    
    for(let i = start; i < end; i++) {

        const { swaps, transfers } = await eventAnalyzer.analyzeEventsInBlock(i);
        
        console.log(swaps);
        console.log(transfers);
        
    }
}



// analyzeBlock(161622);
analyzeBlocks(132974, 132975);