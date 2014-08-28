<?php
/**
 * Kapitchi Zend Framework 2 Modules
 *
 * @copyright Copyright (c) 2012-2014 Kapitchi Open Source Community (http://kapitchi.com/open-source)
 * @license   http://opensource.org/licenses/MIT MIT
 */

namespace KapAlbum;


use KapAlbum\V1\Rest\AlbumItem\AlbumItemEntity;
use KapApigility\DbEntityRepository;
use KapApigility\EntityRepositoryInterface;
use Zend\Db\TableGateway\TableGateway;

class AlbumItemTagRepository extends DbEntityRepository
{
    protected $tagRepository;
    
    public function __construct(TableGateway $table, $identifierName = null, EntityRepositoryInterface $tagRepository)
    {
        parent::__construct($table, $identifierName);
        
        $this->tagRepository = $tagRepository;
    }


    public function setTags(AlbumItemEntity $entity, array $tags)
    {
        $this->getTable()->delete([
            'album_item_id' => $entity['id']
        ]);

        $tagRel = [];
        foreach($tags as $tag) {
            $tagRel[] = $this->create([
                'album_item_id' => $entity['id'],
                'tag_id' => $tag['id']
            ]);
        }
        
        return $tagRel;
    }
    
} 