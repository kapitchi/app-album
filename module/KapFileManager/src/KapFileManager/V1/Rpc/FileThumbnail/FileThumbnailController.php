<?php
namespace KapFileManager\V1\Rpc\FileThumbnail;

use Intervention\Image\ImageManager;
use KapFileManager\FileRepositoryInterface;
use KapFileManager\FilesystemManager;
use Zend\Mvc\Controller\AbstractActionController;

class FileThumbnailController extends AbstractActionController
{
    protected $filesystemManager;
    protected $fileRepository;
    
    public function __construct(FilesystemManager $filesystemManager, FileRepositoryInterface $fileRepository)
    {
        $this->filesystemManager = $filesystemManager;
        $this->fileRepository = $fileRepository;
    }

    public function fileThumbnailAction()
    {
        $filter = $this->params()->fromRoute('filter');
        $width = (int)$this->params()->fromRoute('width');
        $height = (int)$this->params()->fromRoute('height');
        $fileId = (int)$this->params()->fromRoute('file_id');
        
        $invalid = true;
        foreach($this->getValidFilters() as $validFilter) {
            if($validFilter['filter'] === $filter &&
                $validFilter['width'] === $width &&
                $validFilter['height'] === $height
            ) {
                $invalid = false;
                break;
            }
        }
        
        
        //TODO we should return 404 instead of 500 exceptions
        if($invalid) {
            throw new \Exception("Invalid filter type");
        }
        
        
        $fileEntity = $this->fileRepository->find($fileId);
        if(!$fileEntity) {
            throw new \Exception("File doesn't exist");
        }
        
        if($fileEntity['type'] === 'DIR') {
            throw new \Exception("File is DIR type");
        }

        $sourceFilesystem = $this->filesystemManager->get($fileEntity['filesystem']);
        //$sourceStream = $sourceFilesystem->readStream($fileEntity['filesystem_path']);
        $sourceData = $sourceFilesystem->read($fileEntity['filesystem_path']);

        // create an image manager instance with favored driver
        $manager = new ImageManager(array('driver' => 'gd'));
        $image = $manager->make($sourceData);
        
        //filters
        $image->fit($width, $height);
        
        
        //save to public location
        $newImageData = $image->encode('jpg', 80)->__toString();

        $outputFilesystem = $this->filesystemManager->get('file_thumbnail');
        $fileName = $filter . '-' . $width . '-' . $height . '/' . $fileId . '.jpg';
        $outputFilesystem->write($fileName, $newImageData);
        
        echo $image->response('jpg', 80);
        exit;
    }
    
    protected function getValidFilters()
    {
        $config = $this->getServiceLocator()->get('Config');

        if(empty($config['file-manager']['thumbnail-types'])) {
            return [];
        }

        return $config['file-manager']['thumbnail-types'];
    }
}
