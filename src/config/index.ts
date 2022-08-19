const config = {
  iqAddress:
    process.env.NEXT_PUBLIC_IQ_ADDRESS ||
    '0x579cea1889991f68acc35ff5c3dd0621ff29b0c9',
  hiiqAddress:
    process.env.NEXT_PUBLIC_HIIQ_ADDRESS ||
    '0xc03bcacc5377b7cc6634537650a7a1d14711c1a3',
  hiiqRewardAddress:
    process.env.NEXT_PUBLIC_HIIQREWARDS_ADDRESS ||
    '0x36Cae8d96CBB53e139628e63E47ebe2B47a53f1f',
  blockExplorerUrl:
    process.env.NEXT_PUBLIC_BLOCK_EXPLORER_BASE_URL ||
    'https://goerli.etherscan.io/',
  infuraId: process.env.NEXT_PUBLIC_INFURA_ID,
  alchemyApiKey:
    String(process.env.NEXT_PUBLIC_ALCHEMY_API_KEY) ||
    'dgF6IdB0eWQgVz2m5Vo_3ei49RqAGAw5',
  alchemyChain: process.env.NEXT_PUBLIC_ALCHEMY_CHAIN || 'goerli',
  graphqlUrl:
    process.env.NEXT_PUBLIC_EP_API || 'https://api.dev.braindao.org/graphql',
  chainId: process.env.NEXT_PUBLIC_CHAIN_ID || '5',
  chainName: process.env.NEXT_PUBLIC_CHAIN_NAME || 'goerli',
  ensRPC:
    String(process.env.NEXT_PUBLIC_ENS_RPC) ||
    'https://eth-goerli.g.alchemy.com/v2/dgF6IdB0eWQgVz2m5Vo_3ei49RqAGAw5',
}

export default config
