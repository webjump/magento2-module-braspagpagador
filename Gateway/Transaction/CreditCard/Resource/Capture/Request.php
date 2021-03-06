<?php

namespace Webjump\BraspagPagador\Gateway\Transaction\CreditCard\Resource\Capture;

use Webjump\Braspag\Pagador\Transaction\Api\Actions\RequestInterface as BraspaglibRequestInterface;
use Webjump\Braspag\Pagador\Transaction\Api\PaymentSplit\RequestInterface as RequestPaymentSplitLibInterface;
use Webjump\BraspagPagador\Gateway\Transaction\CreditCard\Resource\Capture\RequestInterface as BraspagMagentoRequestInterface;
use Magento\Payment\Gateway\Data\OrderAdapterInterface;
use Webjump\BraspagPagador\Gateway\Transaction\CreditCard\Config\ConfigInterface;
use Webjump\BraspagPagador\Helper\GrandTotal\Pricing as GrandTotalPricingHelper;

/**
 * Capture Request
 *
 * @author      Webjump Core Team <dev@webjump.com>
 * @copyright   2016 Webjump (http://www.webjump.com.br)
 * @license     http://www.webjump.com.br  Copyright
 *
 * @link        http://www.webjump.com.br
 */
class Request implements BraspaglibRequestInterface, BraspagMagentoRequestInterface
{
    protected $config;

    protected $orderAdapter;

    protected $paymentId;

    protected $storeId;

    /**
     * @var
     */
    protected $paymentSplitRequest;

    /**
     * @var GrandTotalPricingHelper
     */
    protected $grandTotalPricingHelper;

    public function __construct(
        ConfigInterface $config,
        GrandTotalPricingHelper $grandTotalPricingHelper
    ) {
        $this->setConfig($config);
        $this->grandTotalPricingHelper = $grandTotalPricingHelper;
    }

    public function getMerchantId()
    {
        $storeId = $this->getOrderAdapter()->getStoreId();

        return $this->getConfig()->getMerchantId($storeId);
    }

    public function getMerchantKey()
    {
        $storeId = $this->getOrderAdapter()->getStoreId();

        return $this->getConfig()->getMerchantKey($storeId);
    }

    public function isTestEnvironment()
    {
        return $this->getConfig()->getIsTestEnvironment();
    }

    public function getPaymentId()
    {
        return $this->paymentId;
    }

    public function getRequestDataBody()
    {
        if (empty($this->getPaymentSplitRequest())) {
            return [];
        }

        $splits = $this->getPaymentSplitRequest()->getSplits();

        $subordinates = [];
        foreach ($splits->getSubordinates() as $subordinate) {

            $subordinates[] = [
                "SubordinateMerchantId" => $subordinate['subordinate_merchant_id'],
                "Amount" => $subordinate['amount'],
                "Fares" => [
                    "Mdr" => $subordinate['fares']['mdr'],
                    "Fee" => $subordinate['fares']['fee']
                ]
            ];
        }

        return [
            'SplitPayments' => $subordinates
        ];
    }

    public function getAdditionalRequest()
    {
        $grandTotalAmount = $this->getOrderAdapter()->getGrandTotalAmount();
        $integerValue = $this->grandTotalPricingHelper->currency($grandTotalAmount);

    	return [
            'amount' => $integerValue
        ];
    }

    protected function getOrderAdapter()
    {
        return $this->orderAdapter;
    }

    public function setOrderAdapter(OrderAdapterInterface $orderAdapter)
    {
        $this->orderAdapter = $orderAdapter;

        return $this;
    }

    public function setPaymentId($paymentId)
    {
        $this->paymentId = $paymentId;

        return $this;
    }

    /**
     * @return ConfigInterface
     */
    protected function getConfig()
    {
        return $this->config;
    }

    protected function setConfig(ConfigInterface $config)
    {
        $this->config = $config;

        return $this;
    }

    /**
     * @inheritDoc
     */
    public function setStoreId($storeId = null)
    {
        $this->storeId = $storeId;
    }

    /**
     * @inheritDoc
     */
    public function getStoreId()
    {
        return $this->storeId;
    }

    /**
     * @param RequestPaymentSplitLibInterface $paymentSplitRequest
     * @return \Webjump\BraspagPagador\Gateway\Transaction\CreditCard\Resource\Authorize\Request
     */
    public function setPaymentSplitRequest(RequestPaymentSplitLibInterface $paymentSplitRequest)
    {
        $this->paymentSplitRequest = $paymentSplitRequest;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getPaymentSplitRequest()
    {
        return $this->paymentSplitRequest;
    }
}
