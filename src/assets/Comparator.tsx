import React from 'react';
import {
    getAssetErc20ByChainAndSymbol, // erc20 is a term for crypto token
    getAssetPriceInfo,
} from '@funkit/api-base'
import { Card, InputGroup, InputNumber, Select, Spin, Toast } from '@douyinfe/semi-ui';


const apiKey = (import.meta.env?.VITE_FUN_KEY || "") as string;

//
// ask AI about what is chainId!
// const tokenInfo = await getAssetErc20ByChainAndSymbol({
//   chainId: '1',
//   symbol: 'USDC',
//   apiKey
// })


// ask AI about what is token addr/chain id
// const price = await getAssetPriceInfo({
//  chainId: '1',
//  assetTokenAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
//  apiKey
// })

const assets = [
  { chainId: '1', symbol: 'USDC' },
  { chainId: '137', symbol: 'USDT' },
  { chainId: '8453', symbol: 'ETH' },
  { chainId: '1', symbol: 'WBTC' },
  // add more assets as needed
];

type Asset = { chainId: string; symbol: string };
type AssetObjectType = Record<string, Asset>;

const assetsObject = assets.reduce<AssetObjectType>((obj, asset) => {
    const newKey = `${asset.symbol}_${asset.chainId}`;
    obj[newKey] = asset;
    return obj;
}, {});

export const Comparator = () => {
    const [usdAmount, setUsdAmount] = React.useState(100);
    const [loading, setLoading] = React.useState(false);
    const [exchangeRate, setExchangeRate] = React.useState<[number, number]>([1, 1]); // Example exchange rate
    const [sourceAssetKey, setSourceAssetKey] = React.useState(Object.keys(assetsObject)[0]);
    const [targetAssetKey, setTargetAssetKey] = React.useState(Object.keys(assetsObject)[1]);

    React.useEffect(() => {
        const fetchPriceData = async (sourceAsset: Asset, targetAsset: Asset) => {
        try {
            setLoading(true);
            const results = await Promise.all(
                [sourceAsset, targetAsset].map(asset =>
                    getAssetErc20ByChainAndSymbol({
                    chainId: asset.chainId,
                    symbol: asset.symbol,
                    apiKey,
                    })
                )
            );

            // For each result call the getAssetPriceInfo function to get the price
            const results2 = await Promise.all(
                results.map(res =>
                    getAssetPriceInfo({ chainId: res.chain, assetTokenAddress: res.address, apiKey })
                )
            );

            const [sourceInfo, targetInfo] = results2
            const sourcePrice = sourceInfo.unitPrice
            const targetPrice = targetInfo.unitPrice
            setExchangeRate([sourcePrice, targetPrice]);
        } catch (error) {
            Toast.error('Failed to fetch price data');
        } finally {
            setLoading(false);
        }
        };

        fetchPriceData(assetsObject[sourceAssetKey], assetsObject[targetAssetKey]);
    }, [sourceAssetKey, targetAssetKey]);

    return (
        <Spin spinning={loading}>
            <Card title="Token Swap Comparator" style={{ width: 600, margin: 'auto' }}>
            {(typeof exchangeRate[0] === 'number' && typeof exchangeRate[1]) === 'number' && <p>
                <span>Exchange Rate: </span>
                <code>1</code>
                <span>&nbsp; {assetsObject[sourceAssetKey].symbol}</span>
                &nbsp;~&nbsp;
                <code>{(exchangeRate[0] / exchangeRate[1]).toFixed(6)}</code>
                <span>&nbsp; {assetsObject[targetAssetKey].symbol}</span>
            </p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                <InputGroup>
                    <Select style={{ width: '200px' }} value={"USD"} disabled>
                    </Select>
                    <InputNumber
                        formatter={value => `${value}`.replace(/[^0-9.]/g, '')}
                        value={usdAmount}
                        onChange={number => setUsdAmount(number as number)}
                        min={0}
                        max={Number.MAX_SAFE_INTEGER}
                        hideButtons
                    />
                </InputGroup>
                <InputGroup>
                    <Select style={{ width: '200px' }} value={sourceAssetKey} onChange={value => setSourceAssetKey(value as string)}>
                        {Object.keys(assetsObject).map(key => (
                            <Select.Option key={key} value={key}>
                                {assetsObject[key].symbol} (Chain {assetsObject[key].chainId})
                            </Select.Option>
                        ))}
                    </Select>
                    <InputNumber
                        formatter={value => `${value}`.replace(/[^0-9.]/g, '')}
                        value={usdAmount / exchangeRate[0]}
                        onChange={number => setUsdAmount(number as number * exchangeRate[0])}
                        min={0}
                        max={Number.MAX_SAFE_INTEGER}
                        hideButtons
                    />
                </InputGroup>
                <InputGroup>
                    <Select style={{ width: '200px' }} value={targetAssetKey} onChange={value => setTargetAssetKey(value as string)}>
                        {Object.keys(assetsObject).map(key => (
                            <Select.Option key={key} value={key}>
                                {assetsObject[key].symbol} (Chain {assetsObject[key].chainId})
                            </Select.Option>
                        ))}
                    </Select>
                    <InputNumber
                        formatter={value => `${value}`.replace(/[^0-9.]/g, '')}
                        value={usdAmount / exchangeRate[1]}
                        onChange={number => setUsdAmount(number as number * exchangeRate[1])}
                        min={0}
                        max={Number.MAX_SAFE_INTEGER}
                        hideButtons
                    />
                </InputGroup>
            </div>
            </Card>
        </Spin>
    )
}