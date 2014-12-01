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
use KapFileManager\V1\Rest\File\FileEntity;
use Zend\Db\Sql\Expression;
use Zend\Db\Sql\Select;
use Zend\Db\Sql\Update;
use Zend\Paginator\Adapter\DbSelect;

class AlbumItemRelRepository extends DbEntityRepository
{
    public function update($id, array $data)
    {
        $data['showcase'] = empty($data['showcase']) ? 0 : 1;
        
        return parent::update($id, $data);
    }
    
    public function create(array $data)
    {
        $insertOnIndex = false;
        if(!empty($data['index'])) {
            $insertOnIndex = $data['index'];
        }
        
        $data['index'] = 0;
        $this->table->insert($data);
        $id = $this->table->getLastInsertValue();

        $index = $id;

        if($insertOnIndex) {
            $update = $this->table->getSql()->update();
            $update->set([
                'index' => new Expression('`index` + 1')
            ]);
            $update->where([
                '`index` >= ?' => $insertOnIndex
            ]);
            $this->table->updateWith($update);
            
            $index = $insertOnIndex;
        }
        
        $this->table->update([
            'index' => $index
        ], [
            'id' => $id
        ]);
        
        $entity = $this->find($id);
        if(!$entity) {
            throw new \Exception("Entity not created?");
        }

        return $entity;
    }

    protected function configurePaginatorSelect(Select $select, array $criteria, array $orderBy)
    {
        if(!empty($criteria['album_owner_id'])) {
            //TODO
            throw new \Exception("N/I");
            
            $ownerId = $criteria['album_owner_id'];

            $select->join('album', 'album_item_rel.album_id = album.id', []);
            $select->where([
                'album.owner_id' => $ownerId
            ]);

            unset($criteria['album_owner_id']);
        }

        if(!empty($criteria['item_type'])) {
            $value = $criteria['item_type'];

            $select->join('album_item', 'album_item_rel.item_id = album_item.id', []);
            $select->where([
                'album_item.type' => $value
            ]);

            unset($criteria['item_type']);
        }

        parent::configurePaginatorSelect($select, $criteria, $orderBy);
    }
    
} 