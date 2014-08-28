<?php
/**
 * Kapitchi Zend Framework 2 Modules
 *
 * @copyright Copyright (c) 2012-2014 Kapitchi Open Source Community (http://kapitchi.com/open-source)
 * @license   http://opensource.org/licenses/MIT MIT
 */

namespace KapAlbum;


use KapAlbum\V1\Rest\AlbumItem\AlbumItemEntity;
use KapApigility\ApiProblem;
use KapApigility\DbEntityRepository;
use KapApigility\EntityRepositoryInterface;
use KapApigility\EntityRepositoryResource;

class AlbumItemResource extends EntityRepositoryResource {
    protected $albumItemTagRepository;
    
    public function __construct(EntityRepositoryInterface $repository, DbEntityRepository $albumItemTagRepository)
    {
        parent::__construct($repository);
        
        $this->albumItemTagRepository = $albumItemTagRepository;
    }

    /**
     * We replace _embedded tag_collection if set
     * 
     * @param mixed $id
     * @param mixed $data
     * @return ApiProblem|mixed
     */
    public function update($id, $data)
    {
        $res = parent::update($id, $data);

        if($data->_embedded['tag_collection']) {
            //$res['_tags'] = $this->albumItemTagRepository->setTags($res, $data->_tags);
            $this->albumItemTagRepository->setTags($res, $data->_embedded['tag_collection']);
        }
        
        return $res;
    }

    public function create($data)
    {
        $res = parent::create($data);

        if($data->_embedded['tag_collection']) {
            //$res['_tags'] = $this->albumItemTagRepository->setTags($res, $data->_tags);
            $this->albumItemTagRepository->setTags($res, $data->_embedded['tag_collection']);
        }

        return $res;
    }

} 