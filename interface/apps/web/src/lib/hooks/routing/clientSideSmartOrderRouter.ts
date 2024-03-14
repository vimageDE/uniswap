import { BigintIsh, ChainId, CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core'
// This file is lazy-loaded, so the import of smart-order-router is intentional.
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { AlphaRouter, AlphaRouterConfig } from '@uniswap/smart-order-router'
import { asSupportedChain } from 'constants/chains'
import { DEPRECATED_RPC_PROVIDERS } from 'constants/providers'
import { nativeOnChain } from 'constants/tokens'
import JSBI from 'jsbi'
import { GetQuoteArgs, QuoteResult, QuoteState, SwapRouterNativeAssets } from 'state/routing/types'
import { transformSwapRouteToGetQuoteResult } from 'utils/transformSwapRouteToGetQuoteResult'

const routers = new Map<ChainId, AlphaRouter>()
export function getRouter(chainId: ChainId): AlphaRouter {
  const router = routers.get(chainId)
  console.log('getRouter - 0')
  if (router) return router
  console.log('getRouter - 1')
  const supportedChainId = asSupportedChain(chainId)
  console.log('getRouter - 2')
  if (supportedChainId) {
    console.log('getRouter - 3')
    const provider = DEPRECATED_RPC_PROVIDERS[supportedChainId]
    console.log('getRouter - 4 - ', provider, supportedChainId)
    let router: any
    try {
      router = new AlphaRouter({ chainId, provider })
      console.log('getRouter - 5')
    } catch (error) {
      console.error('Error instantiating AlphaRouter:', error)
    }
    console.log('getRouter - 5')
    routers.set(chainId, router)
    console.log('getRouter - 6')
    return router
  }

  throw new Error(`Router does not support this chain (chainId: ${chainId}).`)
}

async function getQuote(
  {
    tradeType,
    tokenIn,
    tokenOut,
    amount: amountRaw,
  }: {
    tradeType: TradeType
    tokenIn: { address: string; chainId: number; decimals: number; symbol?: string }
    tokenOut: { address: string; chainId: number; decimals: number; symbol?: string }
    amount: BigintIsh
  },
  router: AlphaRouter,
  routerConfig: Partial<AlphaRouterConfig>
): Promise<QuoteResult> {
  console.log('getQuote - 0 - ', tokenIn, tokenOut, amountRaw)

  const tokenInIsNative = Object.values(SwapRouterNativeAssets).includes(tokenIn.address as SwapRouterNativeAssets)
  const tokenOutIsNative = Object.values(SwapRouterNativeAssets).includes(tokenOut.address as SwapRouterNativeAssets)

  console.log('getQuote - 1')

  const currencyIn = tokenInIsNative
    ? nativeOnChain(tokenIn.chainId)
    : new Token(tokenIn.chainId, tokenIn.address, tokenIn.decimals, tokenIn.symbol)
  const currencyOut = tokenOutIsNative
    ? nativeOnChain(tokenOut.chainId)
    : new Token(tokenOut.chainId, tokenOut.address, tokenOut.decimals, tokenOut.symbol)

  console.log('getQuote - 2')

  const baseCurrency = tradeType === TradeType.EXACT_INPUT ? currencyIn : currencyOut
  const quoteCurrency = tradeType === TradeType.EXACT_INPUT ? currencyOut : currencyIn

  const amount = CurrencyAmount.fromRawAmount(baseCurrency, JSBI.BigInt(amountRaw))

  console.log('getQuote - 3 ', amount)

  // TODO (WEB-2055): explore initializing client side routing on first load (when amountRaw is null) if there are enough users using client-side router preference.
  const swapRoute = await router.route(amount, quoteCurrency, tradeType, /*swapConfig=*/ undefined, routerConfig)

  console.log('Calculated Route: ', swapRoute)

  if (!swapRoute) {
    return { state: QuoteState.NOT_FOUND }
  }

  return transformSwapRouteToGetQuoteResult(tradeType, amount, swapRoute)
}

export async function getClientSideQuote(
  {
    tokenInAddress,
    tokenInChainId,
    tokenInDecimals,
    tokenInSymbol,
    tokenOutAddress,
    tokenOutChainId,
    tokenOutDecimals,
    tokenOutSymbol,
    amount,
    tradeType,
  }: GetQuoteArgs,
  router: AlphaRouter,
  config: Partial<AlphaRouterConfig>
) {
  console.log('getClientSideQuote - 0')
  return getQuote(
    {
      tradeType,
      tokenIn: {
        address: tokenInAddress,
        chainId: tokenInChainId,
        decimals: tokenInDecimals,
        symbol: tokenInSymbol,
      },
      tokenOut: {
        address: tokenOutAddress,
        chainId: tokenOutChainId,
        decimals: tokenOutDecimals,
        symbol: tokenOutSymbol,
      },
      amount,
    },
    router,
    config
  )
}
