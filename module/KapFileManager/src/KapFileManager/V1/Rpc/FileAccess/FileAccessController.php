<?php
namespace KapFileManager\V1\Rpc\FileAccess;

use KapFileManager\FileRepositoryInterface;
use KapFileManager\FilesystemManager;
use Zend\Http\Header\CacheControl;
use Zend\Http\Header\Expires;
use Zend\Http\Header\IfModifiedSince;
use Zend\Http\Header\LastModified;
use Zend\Http\Header\Pragma;
use Zend\Http\Response;
use Zend\Mvc\Controller\AbstractActionController;
use ZF\ApiProblem\ApiProblem;
use ZF\ApiProblem\ApiProblemResponse;

class FileAccessController extends AbstractActionController
{
    protected $manager;
    protected $repository;
    
    public function __construct(FilesystemManager $manager, FileRepositoryInterface $repository)
    {
        $this->manager = $manager;
        $this->repository = $repository;
    }

    public function fileAccessAction()
    {
        $request = $this->getRequest();
        $modifiedSince = $request->getHeader('If-Modified-Since');
        if ($modifiedSince instanceof IfModifiedSince) {
            $response = $this->getResponse();
            $response->setStatusCode(304);
            
            $this->cacheResponse($response);
            
            return $response;
        }
        
        $event = $this->getEvent();

        $data = $event->getParam('ZFContentNegotiationParameterData');
        
        $id = $data->getRouteParam('file_id');
        $forceDownload = (bool)$data->getQueryParam('download', false);
        
        $file = $this->repository->find($id);
        if(!$file) {
            //return new ApiProblem(404, 'No file exists');
            return $this->notFoundAction();
        }
        
        if($file['type'] !== 'FILE') {
            return $this->notFoundAction();
        }
        
        if($file['filesystem_error']) {
            return $this->notFoundAction();
        }
        
        $filesystemName = $file['filesystem'];

        $filesystem = $this->manager->get($filesystemName);

        $response = new \Zend\Http\Response\Stream();
        $response->setStream($filesystem->readStream($file['filesystem_path']));
        $response->setStatusCode(200);

        $headers = $response->getHeaders();
        $headers->addHeaderLine('Content-Type', $file['mime_type']);
        if($forceDownload) {
            $headers->addHeaderLine('Content-Disposition', 'attachment; filename="' . $file['name'] . '"');
            //$headers->addHeaderLine('Content-Length', 7687);//$file['size']);//todo fix size
        }

        /** @var $lastModified LastModified  */
        $lastModified = new LastModified();
        $lastModified->setDate($file['create_time']);
        $headers->addHeader($lastModified);

        $this->cacheResponse($response);
        
        //$response->setHeaders($headers);
        return $response;
    }
    
    protected function cacheResponse(Response $response) {
        // --- Caching ---
        //https://github.com/widmogrod/zf2-semi-http-cache/blob/master/src/WidHttpCache/Listener/HttpCacheListener.php
        //https://developers.google.com/speed/docs/best-practices/caching
        $headers = $response->getHeaders();
        $pragma = new Pragma();
        $headers->addHeader($pragma);
        //$pragma = $headers->get('Pragma');
        //echo __FILE__ . ' Line: ' . __LINE__; var_dump($pragma); exit; //XXX

        $expires = new Expires();
        $expires->setDate('2015-12-12');
        $headers->addHeader($expires);

        /** @var $cacheControl CacheControl */
        $cacheControl = new CacheControl();
        $headers->addHeader($cacheControl);

        $cacheControl->addDirective('max-age', 31536000);

        return $response;
    }
}
