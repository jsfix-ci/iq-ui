import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import {
  Box,
  Flex,
  Text,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
  useToast,
} from '@chakra-ui/react'
import { useGaugeCtrl } from '@/hooks/useGaugeCtrl'
import { useAppSelector } from '@/store/hook'
import { Gauge } from '@/types/gauge'
import { getUnusedWeight } from '@/utils/gauges.util'
import config from '@/config'
import { MAX_USER_WEIGHT } from '@/data/GaugesConstants'

const VotingControls = () => {
  const toast = useToast()
  const currentGauge: Gauge | undefined = useAppSelector(
    state => state.gauges.currentGauge,
  )
  const [weightToAllocate, setWeightToAllocate] = useState(0)
  const { isConnected } = useAccount()
  const { userVotingPower, canVote, vote, isVoting, lastUserVotePlusDelay } =
    useGaugeCtrl()
  const { unusedRaw } = getUnusedWeight(userVotingPower)

  const handleVote = async () => {
    const { isError, msg } = await vote(
      config.nftFarmAddress,
      (weightToAllocate * MAX_USER_WEIGHT) / 100,
    )

    toast({
      title: msg,
      position: 'top-right',
      isClosable: true,
      status: isError ? 'error' : 'success',
    })
  }

  return (
    <Flex direction="column">
      <Flex direction="row" justifyContent="space-between">
        <Slider
          isDisabled={unusedRaw === 0 || !canVote}
          aria-label="slider-ex-2"
          colorScheme="pink"
          defaultValue={0}
          value={weightToAllocate}
          onChange={setWeightToAllocate}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
        <NumberInput
          isDisabled={unusedRaw === 0 || !canVote}
          defaultValue={0}
          ml={3}
          maxW={20}
          min={0}
          max={100}
          value={weightToAllocate}
          onChange={(_, value: number) => setWeightToAllocate(value)}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <Button
          onClick={handleVote}
          disabled={isVoting || !canVote || weightToAllocate === 0}
          ml={4}
        >
          {isVoting ? 'Loading' : 'Vote'}
        </Button>
      </Flex>
      {currentGauge !== undefined ? (
        <Box maxW="sm">
          <Flex flexDirection="row" width={360} justifyContent="space-between">
            <Text fontWeight="bold">Gauge: </Text>
            <Text>{currentGauge.name}</Text>
          </Flex>
          <Flex flexDirection="row" width={360} justifyContent="space-between">
            <Text fontWeight="bold">
              % of the remaining weight to allocate:
            </Text>
            <Text>{100 - weightToAllocate}</Text>
          </Flex>
          {!canVote && isConnected ? (
            <Flex
              flexDirection="row"
              width={460}
              justifyContent="space-between"
            >
              <Text fontWeight="bold">Next voting time:</Text>
              <Text>{lastUserVotePlusDelay}</Text>
            </Flex>
          ) : null}
        </Box>
      ) : null}
    </Flex>
  )
}

export default VotingControls
