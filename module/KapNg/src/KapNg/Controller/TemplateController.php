<?php
/**
 * Zend Framework (http://framework.zend.com/)
 *
 * @link      http://github.com/zendframework/ZendSkeletonApplication for the canonical source repository
 * @copyright Copyright (c) 2005-2014 Zend Technologies USA Inc. (http://www.zend.com)
 * @license   http://framework.zend.com/license/new-bsd New BSD License
 */

namespace KapNg\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;

class TemplateController extends AbstractActionController
{
    public function templateAction()
    {
        $model = new ViewModel();
        $model->setTemplate('ng-template/' . $this->params()->fromRoute('template'));
        $model->setTerminal(true);//disable layout
        
        return $model;
    }
    
}
