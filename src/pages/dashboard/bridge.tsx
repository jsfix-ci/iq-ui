import {
  Button,
  Flex,
  Heading,
  IconButton,
  Text,
  useToast,
} from '@chakra-ui/react'
import { NextPage } from 'next'
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi'
import { UALContext } from 'ual-reactjs-renderer'
import { NextSeo } from 'next-seo'
import { convertTokensTx, getUserTokenBalance } from '@/utils/eos.util'
import { useBridge } from '@/hooks/useBridge'
import {
  AuthContextType,
  getToken,
  initialBalances,
  TokenId,
  TOKENS,
} from '@/types/bridge'
import { IQEosLogo } from '@/components/iq-eos-logo'
import { IQEthLogo } from '@/components/iq-eth-logo'
import { Swap } from '@/components/icons/swap'
import { logEvent } from '@/utils/googleAnalytics'
import { useIQRate } from '@/hooks/useRate'
import { getError } from '@/utils/getError'
import NetworkErrorNotification from '@/components/lock/NetworkErrorNotification'
import CardFooter from '@/components/bridge/cardFooter'
import DestinationInfo from '@/components/bridge/destinationInfo'
import OriginInfo from '@/components/bridge/originInfo'
import config from '@/config'
import TokenMenuLayout from '@/components/bridge/tokenMenuLayout'

const Bridge: NextPage = () => {
  const authContext = useContext<AuthContextType>(UALContext)
  const [selectedToken, setSelectedToken] = useState(TOKENS[0])
  const [selectedTokenIcon, setSelectedTokenIcon] = useState(<IQEosLogo />)
  const [tokenInputAmount, setTokenInputAmount] = useState<string>()
  const [inputAddress, setInputAddress] = useState<string>()
  const [inputAccount, setInputAccount] = useState<string>(
    authContext.activeUser ? authContext.activeUser.accountName : '',
  )
  const [openErrorNetwork, setOpenErrorNetwork] = useState(false)
  const [balances, setBalances] = useState(initialBalances)
  const [isTransferring, setIsTransferring] = useState(false)
  const toast = useToast()
  const { address, isConnected, isDisconnected } = useAccount()
  const { switchNetwork, isSuccess } = useSwitchNetwork()
  const { chain } = useNetwork()
  const chainId = parseInt(config.chainId)
  const { rate: exchangeRate } = useIQRate()
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    iqBalanceOnEth,
    pIQBalance,
    bridgeFromEthToEos,
    bridgeFromPTokenToEth,
  } = useBridge()

  const handleTransfer = async () => {
    setIsTransferring(true)

    if (!tokenInputAmount || Number(tokenInputAmount) === 0) {
      setIsTransferring(false)
      return
    }

    let isError = false
    if (selectedToken.id === TokenId.EOS) {
      let msg = 'Tokens successfully bridge from EOS to the Ptoken bridge'
      try {
        await convertTokensTx(
          `${parseFloat(tokenInputAmount).toFixed(3)} IQ`,
          address || '',
          authContext,
        )
      } catch (error) {
        msg = getError(error).error
        isError = true
      }

      toast({
        title: msg,
        position: 'top-right',
        isClosable: true,
        status: isError ? 'error' : 'success',
      })
    }

    if (selectedToken.id === TokenId.PIQ) {
      const { error } = await bridgeFromPTokenToEth(tokenInputAmount)

      if (error) isError = true

      toast({
        title: error || 'Ptokens bridged successfully',
        position: 'top-right',
        isClosable: true,
        status: error ? 'error' : 'success',
      })
    }

    if (selectedToken.id === TokenId.IQ) {
      const { error } = await bridgeFromEthToEos(tokenInputAmount, inputAccount)

      if (error) isError = true

      toast({
        title: error || 'IQ bridged successfully to EOS',
        position: 'top-right',
        isClosable: true,
        status: error ? 'error' : 'success',
      })
    }

    logEvent({
      action: isError ? 'TOKEN_BRIDGE_ERROR' : 'TOKEN_BRIDGE_SUCCESS',
      label: JSON.stringify(address),
      value: 1,
      category: isError ? 'token_bridge_error' : 'token_bridge_success',
    })

    setIsTransferring(false)
  }

  const getSpecificBalance = (id: TokenId) => {
    if (id) return parseInt(balances.find(b => b.id === id)?.balance || '')

    return 0
  }

  const isBalanceZero = () => Number(getSpecificBalance(selectedToken.id)) === 0

  const disableButton = () => {
    if (isBalanceZero()) return true

    // # EOS
    if (selectedToken.id === TokenId.EOS) {
      // if disconnected
      if (!authContext.activeUser) return true
    }

    // # PIQ
    if (selectedToken.id === TokenId.PIQ && isDisconnected) return true

    // # IQ - PIQ
    if (
      (selectedToken.to.id === TokenId.IQ ||
        selectedToken.to.id === TokenId.PIQ) &&
      (!inputAddress || inputAddress === '')
    )
      return true

    // # IQ
    if (selectedToken.id === TokenId.IQ) {
      if (isDisconnected || !inputAccount || inputAccount === '') return true
    }

    // check the input amount
    if (
      !tokenInputAmount ||
      tokenInputAmount === '' ||
      Number(tokenInputAmount) <= 0
    )
      return true

    if (isTransferring) return true

    return false
  }

  const getReceiversAddressOrAccount = () => {
    const toToken = selectedToken.to

    if (toToken.id === TokenId.EOS && !authContext.activeUser)
      return 'myeosaccount'
    if (toToken.id === TokenId.EOS && authContext.activeUser)
      return authContext.activeUser.accountName
    if (
      (toToken.id === TokenId.IQ || toToken.id === TokenId.PIQ) &&
      isConnected
    )
      return address
    return '0xAe65930180ef4...' // random addr as an example
  }

  const handlePathChange = (id: TokenId) => {
    setSelectedToken(() => getToken(id) || TOKENS[0])
  }

  const getEstimatedArrivingAmount = (): number => {
    if (!tokenInputAmount) return 0

    const arrivingAmount =
      (Number(tokenInputAmount) - Number(tokenInputAmount) * 0.05) *
      exchangeRate

    return Number(arrivingAmount.toFixed(3))
  }

  const handleNetworkSwitch = () => {
    if (switchNetwork) switchNetwork(chainId)
  }

  const handleSetInputAddressOrAccount = (value: string) => {
    if (selectedToken.to.id === TokenId.EOS) setInputAccount(value)
    else setInputAddress(value)
  }

  const handleChainChanged = useCallback(
    (chainDetails: number | undefined) => {
      if (chainDetails && chainDetails !== chainId) {
        setOpenErrorNetwork(true)
      }
    },
    [chainId],
  )

  const handleEOSLoginAndLogout = () => {
    if (!authContext.activeUser) authContext.showModal()
    else authContext.logout()
  }

  useEffect(() => {
    if (chain?.id !== chainId) {
      handleChainChanged(chain?.id)
    }
    if (isSuccess && chainId === chain?.id) {
      setOpenErrorNetwork(false)
    }
  }, [chain, handleChainChanged, isSuccess, chainId])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = getReceiversAddressOrAccount() || ''
      handleSetInputAddressOrAccount(inputRef.current.value)
    }

    if (selectedToken.id === TokenId.IQ) setSelectedTokenIcon(<IQEthLogo />)
    else setSelectedTokenIcon(<IQEosLogo />)
  }, [selectedToken])

  useEffect(() => {
    if (pIQBalance)
      setBalances(currentBalances =>
        currentBalances.map(b => {
          if (b.id === TokenId.PIQ) b.balance = pIQBalance

          return b
        }),
      )
  }, [pIQBalance])

  useEffect(() => {
    if (iqBalanceOnEth)
      setBalances(currentBalances =>
        currentBalances.map(b => {
          if (b.id === TokenId.IQ) b.balance = iqBalanceOnEth

          return b
        }),
      )
  }, [iqBalanceOnEth])

  useEffect(() => {
    const getIQonEosBalance = async () => {
      const balance = await getUserTokenBalance(authContext)
      if (balance)
        setBalances(
          balances.map(b => {
            if (b.id === TokenId.EOS)
              b.balance = balance.toString().replace(' IQ', '')

            return b
          }),
        )
    }

    if (authContext.activeUser) getIQonEosBalance()
  }, [authContext, balances])

  return (
    <>
      <NextSeo
        title="Bridge Page"
        description="Transfer IQ from EOS to ETH and vice versa using this bridge. Swapping to pIQ is an intermediary step."
        openGraph={{
          title: 'IQ Bridge',
          description:
            'Transfer IQ from EOS to ETH and vice versa using this bridge. Swapping to pIQ is an intermediary step. ',
        }}
      />
      <Flex py={{ base: '5', lg: '6' }} direction="column" gap="6" pb="16">
        <Flex direction="column" gap="1">
          <Heading fontWeight="bold" fontSize={{ md: 'xl', lg: '2xl' }}>
            IQ Bridge
          </Heading>
          <Text
            fontSize={{ base: 'sm', md: 'md' }}
            color="fadedText4"
            fontWeight="medium"
          >
            Transfer IQ from EOS to ETH and vice versa using this bridge.
            Swapping to pIQ is an intermediary step.
          </Text>
        </Flex>
        <Flex
          maxW="524px"
          w="full"
          p="5"
          mx={{ md: '40px', lg: '110px ' }}
          rounded="lg"
          border="solid 1px"
          borderColor="divider"
          direction="column"
          gap="6"
          mb={{ base: '10', md: '0' }}
        >
          <TokenMenuLayout
            selectedTokenIcon={selectedTokenIcon}
            selectedToken={selectedToken}
            handlePathChange={handlePathChange}
          />
          <OriginInfo
            selectedToken={selectedToken}
            isBalanceZero={isBalanceZero}
            tokenInputAmount={tokenInputAmount}
            setTokenInputAmount={setTokenInputAmount}
            getSpecificBalance={getSpecificBalance}
          />
          <IconButton
            icon={<Swap />}
            aria-label="Swap"
            variant="outline"
            w="fit-content"
            mx="auto"
            color="brandText"
            onClick={() => handlePathChange(selectedToken.to.id)}
          />

          <Flex direction="column" gap="3">
            <DestinationInfo
              selectedToken={selectedToken}
              getEstimatedArrivingAmount={getEstimatedArrivingAmount}
              inputRef={inputRef}
              isBalanceZero={isBalanceZero}
              handleSetInputAddressOrAccount={handleSetInputAddressOrAccount}
              handleEOSLoginAndLogout={handleEOSLoginAndLogout}
              authContext={authContext}
            />
          </Flex>
          <CardFooter selectedToken={selectedToken} />
          <Button
            disabled={disableButton()}
            isLoading={isTransferring}
            onClick={handleTransfer}
            _hover={{
              boxShadow: 'none',
            }}
          >
            Transfer
          </Button>
        </Flex>
      </Flex>
      <NetworkErrorNotification
        switchNetwork={handleNetworkSwitch}
        isOpen={openErrorNetwork}
        onClose={() => setOpenErrorNetwork(false)}
      />
    </>
  )
}

export default Bridge
