import React, { useEffect, useState } from 'react'
import { Box, Flex, Heading, Text, SimpleGrid } from '@chakra-ui/layout'
import { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import StakeCard from '@/components/cards/StakeCard'
import {
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react'
import GaugesVotingTable from '@/components/gauges/gaugesVotesTable'
import GaugesTable from '@/components/gauges/gaugesTable'
import { useAppDispatch, useAppSelector } from '@/store/hook'
import { Gauge } from '@/types/gauge'
import { useNFTGauge } from '@/hooks/useNFTGauge'
import { useGaugeCtrl } from '@/hooks/useGaugeCtrl'
import { setGauges } from '@/store/slices/gauges-slice'
import config from '@/config'

const Gauges: NextPage = () => {
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0)
  const [weight] = useState(100)
  const [weightToAllocate, setWeightToAllocate] = useState(0)
  const { earned } = useNFTGauge()
  const { userVotingPower, gaugeName } = useGaugeCtrl()

  const dispatch = useAppDispatch()
  const currentGauge: Gauge = useAppSelector(state => state.gauges.currentGauge)

  const bStyles = {
    borderLeft: 'solid 1px',
    borderColor: 'divider2',
  }

  useEffect(() => {
    if (gaugeName) {
      dispatch(
        setGauges({
          name: gaugeName,
          address: config.gaugeCtrlAddress,
          gaugeAddress: config.nftFarmAddress,
        }),
      )
    }
  }, [gaugeName])

  return (
    <>
      <NextSeo
        title="Gauges Page"
        openGraph={{
          title: 'IQ Gauges',
          description: 'Vote for gauges with your weight to earn rewards',
        }}
      />

      <Flex
        py={{ base: '5', lg: '6' }}
        direction="column"
        gap="6"
        pt="2"
        pb="16"
      >
        <Flex direction="column" gap="1">
          <Heading fontWeight="bold" fontSize={{ md: 'xl', lg: '2xl' }}>
            IQ Gauges
          </Heading>
          <Text
            fontSize={{ base: 'sm', md: 'md' }}
            color="fadedText4"
            fontWeight="medium"
          >
            Track all gauges within our IQ platform.
          </Text>

          <SimpleGrid
            columns={{ base: 2, md: 4 }}
            px={{ base: '8', md: '2' }}
            py="3"
            mt="1"
            spacingY="13px"
            justifyContent="space-between"
            border="solid 1px"
            alignItems="center"
            borderColor="divider"
            templateColumns="repeat(5, minmax(0, 1fr))"
            rounded="lg"
            bg="lightCard"
          >
            <StakeCard title="Balance" value={String(earned) || '0'} />
            <StakeCard {...bStyles} title="Weight" value={userVotingPower} />
            <StakeCard {...bStyles} title="Weekly Reward" value="77.5k" />
            <StakeCard
              {...bStyles}
              title="Voting Time Left"
              value="2D 9H 55M"
            />
            <StakeCard
              {...bStyles}
              title="Contracts"
              value={`Rewards Distributor \n GaugeController`}
            />
          </SimpleGrid>

          <Tabs onChange={setSelectedTabIndex} mt={46}>
            <TabList>
              <Tab>Voting Allocation</Tab>
              <Tab>Votes</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <GaugesTable />
              </TabPanel>
              <TabPanel>
                <GaugesVotingTable />
              </TabPanel>
            </TabPanels>
          </Tabs>
          {selectedTabIndex === 0 ? (
            <>
              <Flex direction="row" justifyContent="space-between">
                <Slider
                  aria-label="slider-ex-2"
                  colorScheme="pink"
                  defaultValue={0}
                  onChange={setWeightToAllocate}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
                <NumberInput defaultValue={0} ml={3} maxW={20}>
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Flex>

              {currentGauge !== undefined ? (
                <Box maxW="sm">
                  <Flex
                    flexDirection="row"
                    width={360}
                    justifyContent="space-between"
                  >
                    <Text fontWeight="bold">Gauge: </Text>
                    <Text>{currentGauge.name}</Text>
                  </Flex>
                  <Flex
                    flexDirection="row"
                    width={360}
                    justifyContent="space-between"
                  >
                    <Text fontWeight="bold">Weight to allocate:</Text>
                    <Text>{weightToAllocate}</Text>
                  </Flex>
                  <Flex
                    flexDirection="row"
                    width={360}
                    justifyContent="space-between"
                  >
                    <Text fontWeight="bold">Remaining after the vote:</Text>
                    <Text>{weight - weightToAllocate}</Text>
                  </Flex>
                </Box>
              ) : null}
            </>
          ) : null}
        </Flex>
      </Flex>
    </>
  )
}

export default Gauges