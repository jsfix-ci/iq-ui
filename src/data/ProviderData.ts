import { Bsc } from '@/components/icons/bsc'
import { Fraxswap } from '@/components/icons/fraxswap'
import { QuickSwap } from '@/components/icons/quick-swap'
import { SushiSwap } from '@/components/icons/sushiswap'
import { Upbit } from '@/components/icons/Upbit'
import { CryptoCom } from '@/components/icons/crypto-com'
import { Zapper } from '@/components/icons/zapper'
import { CustomIconType } from './SidebarData'

export const PROVIDERS: ProviderType[] = [
  {
    name: 'Fraxswap',
    icon: Fraxswap,
    route:
      'https://app.frax.finance/swap/main?chain=ethereum&from=0x579CEa1889991f68aCc35Ff5c3dd0621fF29b0C9&to=0x853d955aCEf822Db058eb8505911ED77F175b99e',
  },
  {
    name: 'Binance',
    icon: Bsc,
    route: 'https://www.binance.com/en/trade/IQ_BUSD?theme=dark&type=spot',
  },
  {
    name: 'Upbit',
    icon: Upbit,
    route: 'https://upbit.com/exchange?code=CRIX.UPBIT.KRW-IQ',
  },
  {
    name: 'Crypto.com',
    icon: CryptoCom,
    route: 'https://crypto.com/exchange/trade/spot/IQ_USDT',
  },
  {
    name: 'Sushiswap',
    icon: SushiSwap,
    route:
      'https://app.sushi.com/swap?inputCurrency=0x579CEa1889991f68aCc35Ff5c3dd0621fF29b0C9&outputCurrency=0x6B3595068778DD592e39A122f4f5a5cF09C90fE2',
  },
  {
    name: 'QuickSwap',
    icon: QuickSwap,
    route:
      'https://quickswap.exchange/#/swap?currency0=0x2791bca1f2de4661ed88a30c99a7a9449aa84174&currency1=0xb9638272ad6998708de56bbc0a290a1de534a578',
  },
  {
    name: 'Zapper',
    icon: Zapper,
    route:
      'https://zapper.fi/exchange?sellToken=0x579cea1889991f68acc35ff5c3dd0621ff29b0c9&buyToken=0xdac17f958d2ee523a2206206994597c13d831ec7',
  },
]

export type ProviderType = {
  name: string
  icon: CustomIconType
  route: string
}
