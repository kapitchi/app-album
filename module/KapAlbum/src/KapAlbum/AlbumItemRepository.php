<?php
/**
 * Kapitchi Zend Framework 2 Modules
 *
 * @copyright Copyright (c) 2012-2014 Kapitchi Open Source Community (http://kapitchi.com/open-source)
 * @license   http://opensource.org/licenses/MIT MIT
 */

namespace KapAlbum;


use KapApigility\DbEntityRepository;
use KapApigility\Literal;
use KapFileManager\FileRepositoryInterface;
use KapFileManager\FilesystemManager;
use KapFileManager\V1\Rest\File\FileEntity;
use Zend\Paginator\Adapter\DbSelect;
use ZF\MvcAuth\Identity\GuestIdentity;

class AlbumItemRepository extends DbEntityRepository
{
    protected $filesystemManager;
    protected $fileRepository;
    
    public function __construct($table, $id, FilesystemManager $filesystemManager, FileRepositoryInterface $fileRepository)
    {
        parent::__construct($table, $id);
        
        $this->filesystemManager = $filesystemManager;
        $this->fileRepository = $fileRepository;
    }
    
    protected function updateThumbnail($entity, $thumbUrl)
    {
        $filesystem = $this->filesystemManager->get('album_item_thumbnail');

        //Warning: rewind(): stream does not support seeking in /vagrant/vendor/league/flysystem/src/Adapter/Local.php on line 118
        //$filesystem->writeStream('xxxx.jpg', fopen($thumbUrl, 'r'));

        $fileContent = file_get_contents($thumbUrl);
        if($filesystem->has($entity['id'])) {
            $remove = $this->fileRepository->fetchByPath('album_item_thumbnail', $entity['id']);
            return;
        }
        
        $filesystem->write($entity['id'], $fileContent);
        $fileEntity = $this->fileRepository->createFileEntityFromPath($this->filesystemManager, 'album_item_thumbnail', $entity['id']);
        
        return parent::update($entity['id'], [
            'thumbnail_file_id' => $fileEntity['id']
        ]);
    }
    
    public function create(array $data)
    {
        if($data['type'] === 'FILE' && empty($data['thumbnail_file_id'])) {
            $data['thumbnail_file_id'] = $data['file_id'];
        }
        
        $thumbUrl = null;
        if(!empty($data['thumbnail_file_url'])) {
            $thumbUrl = $data['thumbnail_file_url'];
            unset($data['thumbnail_file_url']);
        }
        
        $entity = parent::create($data);
        
        if(!empty($thumbUrl)) {
            $entity = $this->updateThumbnail($entity, $thumbUrl);
        }
        
//        if($data['type'] === 'YOUTUBE_VIDEO_ID') {
//            $client = new \GuzzleHttp\Client();
//            $res = $client->get('http://gdata.youtube.com/feeds/api/videos/' . $data['youtube_video_id'] . '?v=2&alt=json');
//            $json = $res->json();
//            
//            foreach($json['entry']['media$group']['media$thumbnail'] as $thumb) {
//                if($thumb['yt$name'] === 'hqdefault') {
//                    $thumbUrl = $thumb['url'];
//                    break;
//                }
//            }
//
//            $filesystem = $this->filesystemManager->get('album_item_thumbnail');
//
//            //Warning: rewind(): stream does not support seeking in /vagrant/vendor/league/flysystem/src/Adapter/Local.php on line 118
//            //$filesystem->writeStream('xxxx.jpg', fopen($thumbUrl, 'r'));
//
//            $filesystem->write($entity['id'], file_get_contents($thumbUrl));
//            $fileEntity = $this->fileRepository->createFileEntityFromPath($this->filesystemManager, 'album_item_thumbnail', $entity['id']);
//            return $this->update($entity['id'], [
//                'thumbnail_file_id' => $fileEntity['id']
//            ]);
//        }
        
        return $entity;
    }

    public function update($id, array $data)
    {
        if($data['type'] === 'FILE' && empty($data['thumbnail_file_id'])) {
            $data['thumbnail_file_id'] = $data['file_id'];
        }
 
        $thumbUrl = null;
        if(!empty($data['thumbnail_file_url'])) {
            $thumbUrl = $data['thumbnail_file_url'];
            unset($data['thumbnail_file_url']);
        }
        
        $entity = parent::update($id, $data);

        if(!empty($thumbUrl)) {
            $entity = $this->updateThumbnail($entity, $thumbUrl);
        }
        
        return $entity;
    }


    public function getPaginatorAdapter(array $criteria, array $orderBy = null)
    {
//        if(!empty($criteria['album_id'])) {
//            $table = $this->getTable();
//            $sql = $table->getSql();
//            
//            $select = $sql->select();
//            $select->join('album_item_rel', 'album_item_rel.album_item_id = album_item.id', [], 'inner');
//            
//            $select->where([
//                'album_item_rel.album_id' => $criteria['album_id']
//            ]);
//            
//            $select->order('album_item_rel.index ASC');
//            
//            $criteria['album_items.album_id'] = $criteria['album_id'];
//            unset($criteria['album_id']);
//
//            $resultSetPrototype = $table->getResultSetPrototype();
//            return new DbSelect($select, $sql, $resultSetPrototype);
//        }
        
        return parent::getPaginatorAdapter($criteria, $orderBy);
    }

} 