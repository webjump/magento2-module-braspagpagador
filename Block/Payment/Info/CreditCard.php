<?php

namespace Webjump\BraspagPagador\Block\Payment\Info;

use Magento\Payment\Block\Info;
use Magento\Framework\DataObject;
use Magento\Framework\View\Element\Template\Context;
use Webjump\BraspagPagador\Model\Payment\Info\CreditCardFactoryInterface;
use Webjump\BraspagPagador\Model\Payment\Info\CreditCardFactory;
use Magento\Framework\Pricing\Helper\Data;


class CreditCard extends Info
{
    const TEMPLATE = 'Webjump_BraspagPagador::payment/info/credit_card.phtml';

    /** @var CreditCardFactory */
    protected $creditCardFactory;

    protected $paymentInfo;

    protected $priceHelper;

    public function __construct(
        Context $context,
        CreditCardFactoryInterface $creditCardFactory,
        Data $priceHelper,
        array $data = []
    ) {
        parent::__construct($context, $data);
        $this->creditCardFactory = $creditCardFactory;
        $this->priceHelper = $priceHelper;
    }

    public function _construct()
    {
        $this->setTemplate(self::TEMPLATE);
    }

    /**
     * @param \Magento\Framework\DataObject|array|null $transport
     * @return \Magento\Framework\DataObject
     */
    protected function _prepareSpecificInformation($transport = null)
    {
        $creditCard = $this->creditCardFactory->create($this->getInfo()->getOrder());

        $this->paymentInfo = $creditCard->getPayment();

        $data = new DataObject([
            'brand' => $this->paymentInfo->getCcType(),
            'last_4_digits' => $this->paymentInfo->getCcLast4()
        ]);

        return parent::_prepareSpecificInformation($data);
    }

    public function getInstallmentsInfo()
    {
        $installments = $this->paymentInfo->getAdditionalInformation('cc_installments');
        $amountAuthorized = $this->paymentInfo->getAmountAuthorized();
        $priceFormatted = $this->getPriceHelper()->currency($amountAuthorized, true, false);
        $time = $installments > 1 ? 'times' : 'time';

        return __('%1 Splitted in %2 '. $time, $priceFormatted, $installments);
    }

    protected function getPriceHelper()
    {
        return $this->priceHelper;
    }

    protected function setPriceHelper(Data $priceHelper)
    {
        $this->priceHelper = $priceHelper;
        return $this;
    }
}
