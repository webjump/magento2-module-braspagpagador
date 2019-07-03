<?php
namespace Webjump\BraspagPagador\Setup;

use Magento\Framework\Setup\UpgradeSchemaInterface;
use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\SchemaSetupInterface;

/**
 * @author      Webjump Core Team <dev@webjump.com>
 * @copyright   2016 Webjump (http://www.webjump.com.br)
 * @license     http://www.webjump.com.br  Copyright
 *
 * @link        http://www.webjump.com.br
 */
class UpgradeSchema implements UpgradeSchemaInterface
{
    public function upgrade(SchemaSetupInterface $setup, ModuleContextInterface $context)
    {
        $setup->startSetup();

        if (version_compare($context->getVersion(), '2.0.1') < 0) {
            $this->upgradeTwoZeroOne($setup, $context);
        }

        if (version_compare($context->getVersion(), '2.0.2') < 0) {
            $this->upgradeTwoZeroTwo($setup, $context);
        }

        if (version_compare($context->getVersion(), '3.5.2') < 0) {
            $this->upgradeThreeFiveTwo($setup, $context);
        }

        if (version_compare($context->getVersion(), '3.5.3') < 0) {
            $this->upgradeThreeFiveThree($setup, $context);
        }

        if (version_compare($context->getVersion(), '3.5.4') < 0) {
            $this->upgradeThreeFiveFour($setup, $context);
        }

        if (version_compare($context->getVersion(), '3.7.4') < 0) {
            $this->upgradeThreeFiveFive($setup, $context);
        }

        $setup->endSetup();        
    }

    protected function upgradeTwoZeroOne(SchemaSetupInterface $setup, ModuleContextInterface $context)
    {

        $table = $setup->getConnection()->newTable(
            $setup->getTable('webjump_braspagpagador_cardtoken')
        )->addColumn(
            'entity_id',
            \Magento\Framework\DB\Ddl\Table::TYPE_SMALLINT,
            null,
            ['identity' => true, 'nullable' => false, 'primary' => true, 'unsigned' => true],
            'Entity ID'
        )->addColumn(
            'alias',
            \Magento\Framework\DB\Ddl\Table::TYPE_TEXT,
            255,
            ['nullable' => true],
            'Alias'
        )->addColumn(
            'token',
            \Magento\Framework\DB\Ddl\Table::TYPE_TEXT,
            255,
            [],
            'Token'
        )->addColumn(
            'customer_id',
            \Magento\Framework\DB\Ddl\Table::TYPE_INTEGER,
            null,
            ['unsigned' => true],
            'Customer Id'
        )->addColumn(
            'store_id',
            \Magento\Framework\DB\Ddl\Table::TYPE_SMALLINT,
            null,
            ['unsigned' => true, 'default' => '0'],
            'Store Id'
        )->addColumn(
            'active',
            \Magento\Framework\DB\Ddl\Table::TYPE_INTEGER,
            null,
            ['nullable' => false, 'default' => 0],
            'Active'
        )->addForeignKey(
            $setup->getFkName('webjump_braspagpagador_cardtoken', 'store_id', 'store', 'store_id'),
            'store_id',
            $setup->getTable('store'),
            'store_id',
            \Magento\Framework\DB\Ddl\Table::ACTION_CASCADE
        )->addForeignKey(
            $setup->getFkName('webjump_braspagpagador_cardtoken', 'customer_id', 'customer_entity', 'entity_id'),
            'customer_id',
            $setup->getTable('customer_entity'),
            'entity_id',
            \Magento\Framework\DB\Ddl\Table::ACTION_CASCADE
        )->setComment(
            'Webjump Braspag Pagador'
        );

        $setup->getConnection()->createTable($table);
    }

    protected function upgradeTwoZeroTwo(SchemaSetupInterface $setup, ModuleContextInterface $context)
    {
        $setup->getConnection()->addColumn(
            $setup->getTable('webjump_braspagpagador_cardtoken'),
            'provider',
            [
                'type' => \Magento\Framework\DB\Ddl\Table::TYPE_TEXT,
                'length'    => 60,
                'nullable' => false,
                'comment' => 'Provider'
            ]
        );

        $setup->getConnection()->addColumn(
            $setup->getTable('webjump_braspagpagador_cardtoken'),
            'brand',
            [
                'type' => \Magento\Framework\DB\Ddl\Table::TYPE_TEXT,
                'length'    => 60,
                'nullable' => false,
                'comment' => 'Brands'
            ]
        );
    }

    protected function upgradeThreeFiveTwo(SchemaSetupInterface $setup, ModuleContextInterface $context)
    {
        $setup->getConnection()->addColumn(
            $setup->getTable('webjump_braspagpagador_cardtoken'),
            'method',
            [
                'type' => \Magento\Framework\DB\Ddl\Table::TYPE_TEXT,
                'length' => 60,
                'comment' => 'Payment method'
            ]
        );

        $setup->getConnection()->addIndex(
            $setup->getTable('webjump_braspagpagador_cardtoken'),
            $setup->getIdxName('webjump_braspagpagador_cardtoken', ['customer_id', 'method']),
            ['customer_id', 'method'],
            \Magento\Framework\DB\Adapter\AdapterInterface::INDEX_TYPE_UNIQUE
        );
    }

    protected function upgradeThreeFiveThree(SchemaSetupInterface $setup, ModuleContextInterface $context)
    {
        $setup->getConnection()->changeColumn(
            $setup->getTable('sales_order_payment'),
            'last_trans_id',
            'last_trans_id',
            [
                'type'     => \Magento\Framework\DB\Ddl\Table::TYPE_TEXT,
                'length'   => 36,
                'nullable' => true,
                'comment'  => 'Last Trans Id'
            ]
        );
    }

    protected function upgradeThreeFiveFour(SchemaSetupInterface $setup){
        $connection = $setup->getConnection();
        $connection->query("UPDATE core_config_data SET value = replace(value,'Redecard','Rede') WHERE path like '%payment/braspag_pagador%' and value like '%Redecard%';");
    }

    protected function upgradeThreeFiveFive(SchemaSetupInterface $setup, ModuleContextInterface $context) {

        if ($setup->getConnection()->isTableExists($setup->getTable('webjump_braspagpagador_cardtoken'))) {

            $setup->getConnection()->dropForeignKey(
                $setup->getTable('webjump_braspagpagador_cardtoken'),
                $setup->getFkName(
                    'webjump_braspagpagador_cardtoken',
                    'customer_id',
                    'customer_entity',
                    'entity_id'
                )
            );

            $setup->getConnection()->dropIndex(
                $setup->getTable('webjump_braspagpagador_cardtoken'),
                $setup->getIdxName(
                    'webjump_braspagpagador_cardtoken',
                    ['customer_id', 'method'],
                    \Magento\Framework\DB\Adapter\AdapterInterface::INDEX_TYPE_UNIQUE
                )
            );

            $setup->getConnection()->addForeignKey(
                $setup->getFkName(
                    'webjump_braspagpagador_cardtoken',
                    'customer_id',
                    'customer_entity',
                    'entity_id'
                ),
                $setup->getTable('webjump_braspagpagador_cardtoken'),
                'customer_id',
                $setup->getTable('customer_entity'),
                'entity_id',
                \Magento\Framework\DB\Ddl\Table::ACTION_CASCADE
            );

            $setup->getConnection()->addIndex(
                $setup->getTable('webjump_braspagpagador_cardtoken'),
                $setup->getIdxName(
                    'webjump_braspagpagador_cardtoken',
                    ['customer_id', 'method'],
                    \Magento\Framework\DB\Adapter\AdapterInterface::INDEX_TYPE_INDEX
                ),
                ['customer_id', 'method'],
                \Magento\Framework\DB\Adapter\AdapterInterface::INDEX_TYPE_INDEX
            );

            $setup->getConnection()->addColumn(
                $setup->getTable('webjump_braspagpagador_cardtoken'),
                'mask',
                [
                    'type' => \Magento\Framework\DB\Ddl\Table::TYPE_TEXT,
                    'length' => 255,
                    'comment' => 'Payment method Mask'
                ]
            );

        }

    }
}