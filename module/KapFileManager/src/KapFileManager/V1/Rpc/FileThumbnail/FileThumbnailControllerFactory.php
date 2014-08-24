<?php
namespace KapFileManager\V1\Rpc\FileThumbnail;

class FileThumbnailControllerFactory
{
    public function __invoke($controllers)
    {
        return new FileThumbnailController(
            $controllers->getServiceLocator()->get('KapFileManager\\FilesystemManager'),
            $controllers->getServiceLocator()->get('KapFileManager\\FileRepository')
        );
    }
}
