import React, { useEffect, useState } from 'react'
import {
  Button,
  Divider,
  Flex,
  Heading,
  Icon,
  Text,
  Stack,
  VStack,
  Tooltip,
  useToast,
} from '@chakra-ui/react'
import {
  RiCalculatorFill,
  RiExternalLinkLine,
  RiLinksLine,
  RiQuestionLine,
} from 'react-icons/ri'
import { useLockOverview } from '@/hooks/useLockOverview'
import * as Humanize from 'humanize-plus'
import { useReward } from '@/hooks/useReward'
import { useAccount, useWaitForTransaction } from 'wagmi'
import { getDollarValue } from '@/utils/LockOverviewUtils'

const LockedDetails = ({
  setOpenUnlockNotification,
  setOpenRewardCalculator,
  loading,
}: {
  setOpenUnlockNotification: (status: boolean) => void
  setOpenRewardCalculator: (status: boolean) => void
  loading: boolean
}) => {
  const { userTotalIQLocked, hiiqBalance, lockEndDate } = useLockOverview()
  const { address } = useAccount()
  const {
    checkIfUserIsInitialized,
    checkPoint,
    rewardEarned,
    getYield,
    totalRewardEarned,
  } = useReward()
  const [reward, setReward] = useState(0)
  const [isExpired, setIsExpired] = useState(false)
  const [daysDiff, setDaysDiff] = useState(0)
  const [totalIQReward, setTotalIQReward] = useState(0)
  const [userIsInitialized, setUserIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRewardClaimingLoading, setIsRewardClaimingLoading] = useState(false)
  const [trxHash, setTrxHash] = useState()
  const { data } = useWaitForTransaction({ hash: trxHash })
  const { isConnected } = useAccount()
  const toast = useToast()

  useEffect(() => {
    const resolveReward = async () => {
      const initializationCheck = await checkIfUserIsInitialized()
      setUserIsInitialized(initializationCheck)
      const resolvedReward = await rewardEarned()
      const rate = await getDollarValue()
      setTotalIQReward(resolvedReward)
      setReward(resolvedReward * rate)
    }
    if (totalRewardEarned && isConnected) {
      resolveReward()
    }
  }, [totalRewardEarned, checkIfUserIsInitialized, isConnected, rewardEarned])

  useEffect(() => {
    if (lockEndDate && typeof lockEndDate !== 'number') {
      const currentDateTime = new Date().getTime()
      const lockedTime = lockEndDate.getTime()

      setIsExpired(currentDateTime > lockedTime)
      const differenceInDays =
        (lockedTime - currentDateTime) / (1000 * 3600 * 24)

      if (differenceInDays > 0) setDaysDiff(differenceInDays)
      else setDaysDiff(0)
    }
  }, [lockEndDate, daysDiff])

  const resetValues = () => {
    setIsLoading(false)
    setTrxHash(undefined)
    setIsRewardClaimingLoading(false)
  }

  useEffect(() => {
    if (trxHash && data) {
      if (data.status) {
        toast({
          title: `Transaction successfully performed`,
          position: 'top-right',
          isClosable: true,
          status: 'success',
        })
        resetValues()
      } else {
        toast({
          title: `Transaction could not be completed`,
          position: 'top-right',
          isClosable: true,
          status: 'error',
        })
        resetValues()
      }
    }
  }, [data, trxHash, toast])

  const handleCheckPoint = async () => {
    setIsLoading(true)
    const result = await checkPoint()
    setTrxHash(result.hash)
  }

  const handleClaimReward = async () => {
    setIsRewardClaimingLoading(true)
    const result = await getYield()
    setTrxHash(result.hash)
  }

  return (
    <Flex
      direction="column"
      py="6"
      rounded="lg"
      border="solid 1px "
      borderColor="divider"
      align="center"
      maxW={{ base: 526, lg: 400 }}
      w="full"
      rowGap={5}
      mx={{ base: 'auto', lg: 'none' }}
      mb="auto"
    >
      <VStack align="center" rowGap={2}>
        <Heading fontWeight="bold" fontSize={{ md: 'xl', lg: '2xl' }}>
          Current Lock
        </Heading>
        <Divider
          w="30"
          borderColor="divider"
          display={{ base: 'none', lg: 'inherit' }}
        />
      </VStack>
      <VStack align="center">
        <Text color="grayText2" fontSize="md">
          HiIQ Balance
        </Text>
        <Text fontSize="lg" fontWeight="bold">
          {Humanize.formatNumber(hiiqBalance, 2)} HiIQ
        </Text>
      </VStack>
      <VStack align="center">
        <Text color="grayText2" fontSize="md">
          IQ Locked
        </Text>
        <Text fontSize="lg" fontWeight="bold">
          {Humanize.formatNumber(userTotalIQLocked, 2)} IQ
        </Text>
      </VStack>
      <VStack align="center">
        <Text color="grayText2" fontSize="md">
          Time Remaining
        </Text>
        <Text fontSize="lg" fontWeight="bold">
          {daysDiff < 1 ? '-' : `${daysDiff.toFixed(0)} days`}
        </Text>
      </VStack>
      <VStack align="center">
        <Text color="grayText2" fontSize="md">
          Claimable Reward
        </Text>
        <Text fontSize="lg" fontWeight="bold">
          {totalIQReward > 0 ? `${Humanize.formatNumber(totalIQReward, 2)} ` : '-'}
        </Text>
        <Text fontSize="xs">
          {reward > 0 ? `${Humanize.formatNumber(reward, 5)} $` : '-'}
        </Text>
      </VStack>
      <VStack rowGap={2}>
        <Stack direction="row" spacing={3}>
          <Button
            fontSize={{ base: 'xs', md: 'sm' }}
            w={{ base: 130, md: 164 }}
            variant="solid"
            disabled={reward <= 0}
            isLoading={isRewardClaimingLoading}
            onClick={handleClaimReward}
          >
            Claim Rewards
          </Button>
          <Button
            borderColor="divider2"
            variant="outline"
            fontSize={{ base: 'xs', md: 'sm' }}
            w={{ base: 130, md: 164 }}
            onClick={handleCheckPoint}
            isDisabled={
              !(
                !userIsInitialized &&
                userTotalIQLocked > 0 &&
                userIsInitialized !== undefined
              )
            }
            isLoading={isLoading}
          >
            Checkpoint
          </Button>
          <Tooltip
            color="tooltipColor"
            placement="top"
            rounded="lg"
            p={5}
            bg="tooltipBg"
            shouldWrapChildren
            hasArrow
            label="The checkpoint action is needed to keep track of the hiiq supply for a particular user."
          >
            <Icon color="brandText" as={RiQuestionLine} mr={1} />
          </Tooltip>
        </Stack>
        <Button
          onClick={() => setOpenUnlockNotification(true)}
          fontWeight="bold"
          color="brand.500"
          variant="ghost"
          disabled={!isExpired}
          isLoading={loading}
        >
          Unlock
        </Button>
      </VStack>
      <VStack rowGap={2}>
        <Stack direction="row" spacing={36}>
          <Stack direction="row" spacing={2}>
            <Icon fontSize={23} as={RiCalculatorFill} />
            <Text color="grayText2" fontSize="sm">
              Reward Calculator{' '}
            </Text>
          </Stack>
          <Icon
            cursor="pointer"
            onClick={() => setOpenRewardCalculator(true)}
            fontSize={23}
            as={RiExternalLinkLine}
          />
        </Stack>
        <Stack direction="row" spacing={28}>
          <Stack direction="row" spacing={2}>
            <Icon fontSize={23} as={RiLinksLine} />
            <Text color="grayText2" fontSize="sm">
              View Contract Address{' '}
            </Text>
          </Stack>
          <Icon
            cursor="pointer"
            onClick={() =>
              window.open(`https://etherscan.io/address/${address}`, '_blank')
            }
            fontSize={23}
            as={RiExternalLinkLine}
          />
        </Stack>
      </VStack>
    </Flex>
  )
}

export default LockedDetails
