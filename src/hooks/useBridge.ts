import {
  useAccount,
  useContract,
  useContractRead,
  useContractWrite,
  useSigner,
} from 'wagmi'
import { BigNumber, Signer, utils, constants, Contract } from 'ethers'
import { erc20Abi } from '@/abis/erc20.abi'
import { minterAbi } from '@/abis/minter.abi'
import { ptokenAbi } from '@/abis/ptoken.abi'
import config from '@/config'

export const useBridge = () => {
  const { address } = useAccount()
  const { data: signer } = useSigner()

  const { writeAsync: mint } = useContractWrite({
    addressOrName: config.pMinterAddress,
    contractInterface: minterAbi,
    functionName: 'mint',
  })

  const { writeAsync: burn } = useContractWrite({
    addressOrName: config.pMinterAddress,
    contractInterface: minterAbi,
    functionName: 'burn',
  })

  const { writeAsync: redeem } = useContractWrite({
    addressOrName: config.pIqAddress,
    contractInterface: ptokenAbi,
    functionName: 'redeem',
  })

  const { data: pTokenBalance } = useContractRead({
    addressOrName: config.pIqAddress,
    contractInterface: erc20Abi,
    functionName: 'balanceOf',
    watch: true,
    args: [address],
  })

  const { data: iqBalance } = useContractRead({
    addressOrName: config.iqAddress,
    contractInterface: erc20Abi,
    functionName: 'balanceOf',
    watch: true,
    args: [address],
  })

  const iqErc20Contract = useContract({
    addressOrName: config.iqAddress,
    contractInterface: erc20Abi,
    signerOrProvider: signer as Signer,
  })

  const pIqErc20Contract = useContract({
    addressOrName: config.pIqAddress,
    contractInterface: erc20Abi,
    signerOrProvider: signer as Signer,
  })

  const needsApproval = async (
    amount: BigNumber,
    spender: string,
    erc20: Contract,
  ) => {
    const allowedTokens = await erc20.allowance(address, spender)
    if (allowedTokens.lt(amount)) {
      const approvedResult = await erc20.approve(spender, constants.MaxUint256)
      await approvedResult.wait()
    }
  }

  const getPIQBalance = () => {
    if (pTokenBalance) return utils.formatEther(pTokenBalance)

    return '0'
  }

  const getIQBalanceOnEth = () => {
    if (iqBalance) return utils.formatEther(iqBalance)

    return '0'
  }

  const bridgeFromEthToEos = async (amount: string, eosAccount: string) => {
    const amountParsed = utils.parseEther(amount)

    await needsApproval(amountParsed, config.pMinterAddress, iqErc20Contract)

    const burnResult = await burn({ args: [amountParsed] })
    await burnResult.wait()

    const result = await redeem({
      args: [amountParsed, eosAccount],
      overrides: { gasLimit: 5e5 },
    })

    return result
  }

  const bridgeFromPTokenToEth = async (amount: string) => {
    const amountParsed = utils.parseEther(amount)

    await needsApproval(amountParsed, config.pMinterAddress, pIqErc20Contract)

    const result = await mint({
      args: [amountParsed],
      overrides: { gasLimit: 5e5 },
    })
    return result
  }

  return {
    pIQBalance: getPIQBalance(),
    iqBalanceOnEth: getIQBalanceOnEth(),
    bridgeFromEthToEos: (amount: string, eosAccount: string) =>
      bridgeFromEthToEos(amount, eosAccount),
    bridgeFromPTokenToEth: (amount: string) => bridgeFromPTokenToEth(amount),
  }
}
