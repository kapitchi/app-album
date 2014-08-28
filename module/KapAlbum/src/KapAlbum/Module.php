<?php
namespace KapAlbum;

use KapAlbum\V1\Rest\Album\AlbumCollection;
use KapAlbum\V1\Rest\Album\AlbumEntity;
use KapAlbum\V1\Rest\AlbumItem\AlbumItemCollection;
use KapAlbum\V1\Rest\AlbumItem\AlbumItemEntity;
use KapAlbum\V1\Rest\AlbumItemRel\AlbumItemRelEntity;
use KapAlbum\V1\Rest\AlbumItemTag\AlbumItemTagCollection;
use KapAlbum\V1\Rest\AlbumItemTag\AlbumItemTagEntity;
use KapApigility\DbEntityRepository;
use KapApigility\EntityRepositoryResource;
use KapTaxonomy\V1\Rest\Tag\TagCollection;
use KapTaxonomy\V1\Rest\Tag\TagEntity;
use Zend\Mvc\MvcEvent;
use Zend\Paginator\Adapter\ArrayAdapter;
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
        
        $embeddingHal = $e->getParam('embeddingHalEntity');

        if($entity instanceof AlbumEntity && !($embeddingHal && $embeddingHal->entity instanceof AlbumItemEntity)) {
            
            if(!empty($entity['primary_item_id'])) {
                $albumItemRepo = $this->sm->get('KapAlbum\\AlbumItemRepository');
                $entity['primary_item'] = $albumItemRepo->find($entity['primary_item_id']);
            }
        }

        if($entity instanceof AlbumItemEntity) {
            //tags
            $tagRepository = $this->sm->get('KapTaxonomy\\TagRepository');

            $adapter = $this->sm->get('KapAlbum\AlbumItemTagRepository')->getPaginatorAdapter([
                'album_item_id' => $entity['id']
            ]);
            
            $tags = [];
            foreach($adapter->getItems(0, 9999)->toArray() as $itemTag) {
                $tags[] = $tagRepository->find($itemTag['tag_id']);
            }
            
            $entity['tag_collection'] = new TagCollection(new ArrayAdapter($tags));
            //END
            
            //albums
            $albumRepo = $this->sm->get('KapAlbum\\AlbumRepository');
            $adapter = $this->sm->get('KapAlbum\AlbumItemRelRepository')->getPaginatorAdapter([
                'album_item_id' => $entity['id']
            ]);

            $tags = [];
            foreach($adapter->getItems(0, 9999)->toArray() as $itemTag) {
                $tags[] = $albumRepo->find($itemTag['album_id']);
            }
            
            $entity['album_collection'] = new AlbumCollection(new ArrayAdapter($tags));
            //END
            
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

        if($entity instanceof AlbumItemTagEntity) {
            $repo = $this->sm->get('KapTaxonomy\\TagRepository');
            $item = $repo->find($entity['tag_id']);
            $entity['tag'] = $item;
        }

        if($entity instanceof TagEntity) {
            
            $embeddingHal = $e->getParam('embeddingHalEntity');
            if($embeddingHal && $embeddingHal->entity instanceof AlbumItemEntity) {
                //XXXXXXXXXX RETURN HERE!!!
                return;
            }
            
            //$embed = $e->getTarget()->getController()->getRequest()->getQuery()->get('embed');
            
            //if(!empty($embed['all'])) {
                //album items
                $albumItemRepository = $this->sm->get('KapAlbum\\AlbumItemRepository');

                $adapter = $this->sm->get('KapAlbum\AlbumItemTagRepository')->getPaginatorAdapter([
                    'tag_id' => $entity['id']
                ]);

                $embedItems = [];
                foreach($adapter->getItems(0, 9999)->toArray() as $itemTag) {
                    $embedItems[] = $albumItemRepository->find($itemTag['album_item_id']);
                }

                $entity['album_item_collection'] = new AlbumItemCollection(new ArrayAdapter($embedItems));
            //}
        }
        
    }
    
    public function getServiceConfig()
    {
        return [
            'factories' => [
                'KapAlbum\\AlbumRepository' => function($sm) {
                        $ins = new DbEntityRepository(
                            $sm->get('KapAlbum\V1\Rest\Album\AlbumResource\Table')
                        );
                        return $ins;
                    },
                "KapAlbum\\V1\\Rest\\Album\\AlbumResource" => function($sm) {
                        $ins = new EntityRepositoryResource(
                            $sm->get('KapAlbum\\AlbumRepository')
                        );
                        return $ins;
                    },
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
                        $ins = new AlbumItemResource(
                            $sm->get('KapAlbum\\AlbumItemRepository'),
                            $sm->get('KapAlbum\\AlbumItemTagRepository')
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
                        $ins = new EntityRepositoryResource(
                            $sm->get('KapAlbum\\AlbumItemRelRepository')
                        );
                        return $ins;
                    },
                'KapAlbum\\AlbumItemTagRepository' => function($sm) {
                    $ins = new AlbumItemTagRepository(
                        $sm->get('KapAlbum\V1\Rest\AlbumItemTag\AlbumItemTagResource\Table'),
                        'id',
                        $sm->get('KapTaxonomy\TagRepository')
                    );
                    return $ins;
                },
                "KapAlbum\\V1\\Rest\\AlbumItemTag\\AlbumItemTagResource" => function($sm) {
                    $ins = new EntityRepositoryResource(
                        $sm->get('KapAlbum\\AlbumItemTagRepository')
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
