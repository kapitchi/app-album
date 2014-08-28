<?php
namespace KapTaxonomy;

use KapApigility\DbEntityRepository;
use KapApigility\EntityRepositoryResource;
use Zend\Mvc\MvcEvent;
use ZF\Apigility\Provider\ApigilityProviderInterface;

class Module implements ApigilityProviderInterface
{
    public function onBootstrap($e)
    {
        $app = $e->getTarget();
        $this->sm = $app->getServiceManager();

        $events   = $app->getEventManager();
        $events->attach(MvcEvent::EVENT_RENDER, array($this, 'onRender'), 110);
    }

    public function onRender($e)
    {
        $helpers = $this->sm->get('ViewHelperManager');
        $hal = $helpers->get('hal');

        $hal->getEventManager()->attach(['renderEntity', 'renderCollection.entity'], array($this, 'onRenderCollectionEntity'));
    }

    public function onRenderCollectionEntity($e)
    {
        if($e->getName() === 'renderEntity') {
            $entity = $e->getParam('entity')->entity;
        }
        else {
            $entity = $e->getParam('entity');
        }

        //TODO
    }

    public function getServiceConfig()
    {
        return [
            'factories' => [
                'KapTaxonomy\\TagRepository' => function($sm) {
                        $ins = new TagRepository(
                            $sm->get('KapTaxonomy\V1\Rest\Tag\TagResource\Table')
                        );
                        return $ins;
                    },
                "KapTaxonomy\\V1\\Rest\\Tag\\TagResource" => function($sm) {
                        $ins = new EntityRepositoryResource(
                            $sm->get('KapTaxonomy\\TagRepository')
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
