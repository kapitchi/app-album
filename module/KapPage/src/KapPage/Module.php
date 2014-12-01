<?php
namespace KapPage;

use KapApigility\DbEntityRepository;
use KapApigility\EntityRepositoryResource;
use ZF\Apigility\Provider\ApigilityProviderInterface;

class Module implements ApigilityProviderInterface
{
    public function getServiceConfig()
    {
        return [
            'factories' => [
                'KapPage\\PageRepository' => function($sm) {
                        $ins = new DbEntityRepository(
                            $sm->get('KapPage\V1\Rest\Page\PageResource\Table')
                        );
                        return $ins;
                    },
                "KapPage\\V1\\Rest\\Page\\PageResource" => function($sm) {
                        $ins = new EntityRepositoryResource(
                            $sm->get('KapPage\\PageRepository')
                        );
                        return $ins;
                    },

            ]
        ];
    }
    
    public function getConfig()
    {
        return include __DIR__ . '/../../config/module.config.php';
    }

    public function getAutoloaderConfig()
    {
        return array(
            'ZF\Apigility\Autoloader' => array(
                'namespaces' => array(
                    __NAMESPACE__ => __DIR__,
                ),
            ),
        );
    }
}
