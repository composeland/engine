import { FastifyInstance } from "fastify";
import { StatusCodes } from "http-status-codes";
import { createCustomError } from "../../../core/index";
import { Static, Type } from "@sinclair/typebox";
import { standardResponseSchema } from "../../helpers/sharedApiSchemas";
import { allChains, minimizeChain } from "@thirdweb-dev/chains";
import { networkRequestQuerystringSchema } from "../../schemas/network";
import { networkResponseSchema } from "../../../core/schema";

// OUPUT
const responseSchema = Type.Object({
  result: networkResponseSchema,
});

responseSchema.examples = [
  {
    result: {
      result: {
        name: "Mumbai",
        chain: "Polygon",
        rpc: ["https://mumbai.rpc.thirdweb.com/${THIRDWEB_API_KEY}"],
        nativeCurrency: {
          name: "MATIC",
          symbol: "MATIC",
          decimals: 18,
        },
        shortName: "maticmum",
        chainId: 80001,
        testnet: true,
        slug: "mumbai",
      },
    },
  },
];

// LOGIC
export async function getChainData(fastify: FastifyInstance) {
  fastify.route<{
    Querystring: Static<typeof networkRequestQuerystringSchema>;
    Reply: Static<typeof responseSchema>;
  }>({
    method: "GET",
    url: "/network/get",
    schema: {
      description: "Get a particular network/chain information",
      tags: ["Network"],
      operationId: "getNetworkData",
      querystring: networkRequestQuerystringSchema,
      response: {
        ...standardResponseSchema,
        [StatusCodes.OK]: responseSchema,
      },
    },
    handler: async (request, reply) => {
      const { network } = request.query;

      const chain = allChains.find((chain) => {
        if (
          chain.name === network ||
          chain.chainId === Number(network) ||
          chain.slug === network
        ) {
          return chain;
        }
      });

      if (!chain) {
        const error = createCustomError(
          "Chain not found",
          StatusCodes.NOT_FOUND,
          "ChainNotFound",
        );
        throw error;
      }

      const minimizeChainData = minimizeChain(chain);

      reply.status(StatusCodes.OK).send({
        result: {
          ...minimizeChainData,
          rpc: [chain.rpc.length === 0 ? "" : minimizeChainData.rpc[0]],
        },
      });
    },
  });
}