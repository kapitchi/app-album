<?php
/**
 * Kapitchi Zend Framework 2 Modules
 *
 * @copyright Copyright (c) 2012-2014 Kapitchi Open Source Community (http://kapitchi.com/open-source)
 * @license   http://opensource.org/licenses/MIT MIT
 */

namespace KapTaxonomy;


use KapApigility\DbEntityRepository;
use Zend\Db\Sql\Literal;
use Zend\Db\Sql\Predicate\Like;
use Zend\Db\Sql\Select;
use Zend\Db\Sql\Where;
use Zend\Paginator\Adapter\DbTableGateway;

class TagRepository extends DbEntityRepository {
    protected function configurePaginatorSelect(Select $select, array $criteria, array $orderBy)
    {
        if(!empty($criteria['fulltext'])) {
            $fulltext = $criteria['fulltext'];
            
            $select->where->like('name', '%' . $fulltext . '%');
            
            unset($criteria['fulltext']);
        }

        parent::configurePaginatorSelect($select, $criteria, $orderBy);
    }

} 