<?php
namespace KapAlbum;

use KapAlbum\V1\Rest\AlbumItem\AlbumItemEntity;
use KapAlbum\V1\Rest\AlbumItemRel\AlbumItemRelEntity;
use KapApigility\DbEntityRepository;
use Zend\Mvc\MvcEvent;
use ZF\Apigility\Provider\ApigilityProviderInterface;
use ZF\Hal\Link\Link;

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
        
        if($entity instanceof AlbumEntity) {
            
        }

        if($entity instanceof AlbumItemEntity) {
            if($entity['type'] == 'FILE') {
                $fileRepo = $this->sm->get('KapFileManager\\FileRepository');
                $entity['file'] = $fileRepo->find($entity['file_id']);
            }

            if(!empty($entity['thumbnail_file_id'])) {
                $fileRepo = $this->sm->get('KapFileManager\\FileRepository');
                $entity['thumbnail_file'] = $fileRepo->find($entity['thumbnail_file_id']);
            }
        }


        if($entity instanceof AlbumItemRelEntity) {
            $itemRepo = $this->sm->get('KapAlbum\\AlbumItemRepository');
            $item = $itemRepo->find($entity['album_item_id']);
            
            $entity['album_item'] = $item;
        }
        
    }
    
    public function getServiceConfig()
    {
        return [
            'factories' => [
                'KapAlbum\\AlbumItemRepository' => function($sm) {
                        $ins = new AlbumItemRepository(
                            $sm->get('KapAlbum\V1\Rest\AlbumItem\AlbumItemResource\Table'),
                            'id',
                            $sm->get('KapFileManager\\FilesystemManager'),
                            $sm->get('KapFileManager\\FileRepository')
                        );
                        return $ins;
                    },
                "KapAlbum\\V1\\Rest\\AlbumItem\\AlbumItemResource" => function($sm) {
                        $ins = new \KapApigility\EntityRepositoryResource(
                            $sm->get('KapAlbum\\AlbumItemRepository')
                        );
                        return $ins;
                    },
                'KapAlbum\\AlbumItemRelRepository' => function($sm) {
                        $ins = new AlbumItemRelRepository(
                            $sm->get('KapAlbum\V1\Rest\AlbumItemRel\AlbumItemRelResource\Table')
                        );
                        return $ins;
                    },
                "KapAlbum\\V1\\Rest\\AlbumItemRel\\AlbumItemRelResource" => function($sm) {
                        $ins = new \KapApigility\EntityRepositoryResource(
                            $sm->get('KapAlbum\\AlbumItemRelRepository')
                        );
                        return $ins;
                    }
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
