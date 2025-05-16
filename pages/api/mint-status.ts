import { Aptos, AptosConfig, type ClientConfig, Network } from "@aptos-labs/ts-sdk"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Configure Aptos client
    const clientConfig: ClientConfig = {
      API_KEY: "c-wi-q8PJVYuhwOtuQo4UQ2P4~GCG7ek",
    }

    const config = new AptosConfig({
      network: Network.MAINNET,
      indexer: "https://aptos-mainnet.nodit.io/c-wi-q8PJVYuhwOtuQo4UQ2P4~GCG7ek/v1/graphql",
      clientConfig,
    })

    const aptos = new Aptos(config)

    // Query the indexer
    const response = await aptos.queryIndexer({
      query: {
        query: `
          query GetCollectionHolders($collectionId: String!) {
            current_collection_ownership_v2_view(
              where: { collection_id: { _eq: $collectionId } }
            ) {
              current_collection {
                current_supply
                max_supply
                total_minted_v2
              }
            }
          }
        `,
        variables: {
          collectionId: "0xd876f468c5cef5c5d0e100a28dd84ce87a640a6d4e391b379108f84e36da6c32",
        },
      },
    })

    res.status(200).json(response)
  } catch (error) {
    console.error("Error fetching mint status:", error)
    res.status(500).json({ error: "Failed to fetch mint status" })
  }
} 