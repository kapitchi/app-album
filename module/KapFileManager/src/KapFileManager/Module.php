<?php
namespace KapFileManager;

use KapFileManager\V1\Rest\File\FileEntity;
use KapFileManager\V1\Rest\File\FileResource;
use Zend\Db\TableGateway\TableGateway;
use Zend\ModuleManager\Feature\ServiceProviderInterface;
use Zend\Mvc\MvcEvent;
use ZF\Apigility\Provider\ApigilityProviderInterface;
use ZF\Hal\Link\Link;

class Module implements ApigilityProviderInterface, ServiceProviderInterface
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
        //this needs to be onRender otherwise it would throw an exception, it looks like hal can't be created before onRender
        //"Missing parameter "name" - Zend/Mvc/Router/Http/Segment.php(313) - Zend\Mvc\Router\Http\Segment->buildPath(Array, Array, true, true, Array)

        $helpers = $this->sm->get('ViewHelperManager');
        $hal = $helpers->get('hal');

        $hal->getEventManager()->attach(['renderEntity', 'renderCollection.entity'], array($this, 'onRenderEntity'));
    }

    public function onRenderEntity($e)
    {
        if($e->getName() === 'renderEntity') {
            $entity = $e->getParam('entity')->entity;
        }
        else {
            $entity = $e->getParam('entity');
        }
        
        if($entity instanceof FileEntity && $entity['type'] === 'FILE') {
            
            $entity['access'] = Link::factory(array(
                'rel' => 'access',
                'route' => [
                    'name' => 'kap-file-manager.rpc.file-access',
                    'params' => [
                        'file_id' => $entity['id']
                    ]
                ],
            ));

            $entity['download'] = Link::factory(array(
                'rel' => 'download',
                'route' => [
                    'name' => 'kap-file-manager.rpc.file-access',
                    'params' => [
                        'file_id' => $entity['id']
                    ],
                    'options' => [
                        'query' => [
                            'download' => true
                        ]
                    ]
                ],
            ));
            
            $this->injectThumbnailLinks($entity);
        }
        
    }
    
    protected function injectThumbnailLinks($entity) {
        
        $config = $this->sm->get('Config');
        
        if(empty($config['file-manager']['thumbnail-types'])) {
            return [];
        }
        
        foreach($config['file-manager']['thumbnail-types'] as $typeName => $type) {
            if(strpos($entity['mime_type'], 'image') === 0) {
                $entity['thumbnail_' . $typeName] = Link::factory(array(
                    'rel' => 'thumbnail_' . $typeName,
                    'route' => [
                        'name' => 'kap-file-manager.rpc.file-thumbnail',
                        'params' => [
                            'filter' => $type['filter'],
                            'width' => $type['width'],
                            'height' => $type['height'],
                            'file_id' => $entity['id']
                        ]
                    ],
                ));
            }
            else {
                throw new \Exception("TODO what's thumbnail for {$entity['mime_type']}?");
            }
        }
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

    /**
     * Expected to return \Zend\ServiceManager\Config object or array to
     * seed such an object.
     *
     * @return array|\Zend\ServiceManager\Config
     */
    public function getServiceConfig()
    {
        return [
            'factories' => [
                'KapFileManager\\FilesystemManager' => 'KapFileManager\\FilesystemManagerFactory',
                'KapFileManager\\FileRepository' => function($sm) {
                        $ins = new FileDbRepository(
                            $sm->get('KapFileManager\\V1\\Rest\\File\\FileResource\\Table'),
                            $sm->get('KapFileManager\\FilesystemManager')
                        );
                        return $ins;
                    },
                "KapFileManager\\V1\\Rest\\File\\FileResource" => function($sm) {
                        $ins = new FileResource(
                            $sm->get('KapFileManager\\FileRepository'),
                            $sm->get('KapFileManager\\FilesystemManager')
                        );
                        
                        return $ins;
                    }
            ]
        ];
    }

}
