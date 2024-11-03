---
title: Creating a REST-API which receives and transforms multiple images into a single PDF
date: 2024-10-30
author: Jeffrey Freiwald
---

In this tutorial, we'll create a REST API that allows users to upload images of various formats, which will then be converted into a single PDF file. We'll be using **Symfony** as our PHP framework and **Imagick** as our library for image manipulation.

## Technologies

- **Symfony**: A PHP framework used for developing web applications.
- **Imagick**: An open-source software suite for creating, editing, converting, and displaying images in various formats.

## The Problem
In our web application users need to have the capability to upload images in different formats. These images should be converted into PDF format and merged together if multiple images are uploaded.

## The Solution

## Step 1: Create a new Symfony Project
First of all we need to create a new Symfony Project following the steps from: https://symfony.com/doc/current/setup.html

## Step 2: Defining the Controller
Now we'll start by defining a controller that receives a `POST` request containing the uploaded files:

```php
class ConvertFileToPDF extends AbtractController
{
 #[Route('/convert-file', name: 'app_convert_file', methods: ['POST'])]
	public function getFiles(Request $request): JsonResponse
	{
		$files = $request->files->get('files', []);

		try{
			$filePath = $this->documentService->handleUpload($files);
		}catch(\Exception $e){
			return $this->json([
				'status' => 'error',
					'message' => 'Error: Document upload failed: ' . trim($e->getMessage())
			], JsonResponse::HTTP_BAD_REQUEST);
		}
	}
}
```

This controller retrieves the uploaded files and passes them to the `handleUpload($files)` method of the `documentService`.

## Step 3: Implementing the Service
The `documentService` contains the core functionality. We'll start by defining a couple of variables:
- `private string $uploadDirectory`: The directory where the files will be uploaded.
- `private \Imagieck $imagick`: An instance of the Imagick class.

```php
class DocumentUploadService  
{  
    private string $uploadDirectory;
	private \Imagick $imagick;
// ...
```


## Step 4: Handling File Uploads
The `handleUpload(array $files)` method serves as an entry point for this service:
```php
public function handleUpload(array $files)
{
	if(empty$files){
		throw new \Exception('No files uploaded.');	
	}
	// Additional validation of the files could be performed here 
	return $this->normalizeFileTypes($files);
}
```


## Step 5: Normalizing File Types
the `normalizeFileTypes(array $files)` method iterates through the files, and checks if each file is already in PDF format. If so, it saves the file using the `saveUploadedFile($file)` method.
If the file is not in PDF format, it converts it  using the `createPdf($file)` method.
If more than one PDF file is created the `mergePDF($files)` method is called:

```php
public function normalizeFileTypes(array $files, string $companyId): array  
{  
    $normalizedFiles = [];  
    foreach ($files as $file) {  
        if ($file->getMimeType() === 'application/pdf') {  
            $normalizedFiles[] = $this->saveUploadedFile($file, $companyId);  
        } else {  
            $normalizedFiles[] = $this->createPdf($file, $companyId);  
        }  
    }  
    if (count($normalizedFiles) > 1) {  
        return [$this->mergePdf($normalizedFiles, $companyId)];  
    }  
  
    return $normalizedFiles;  
}
```


## Step 6: Saving Uploaded Files
The `saveUploadedFile(UploadedFile $file)` method generates a random number and saves the file in the specified directory. You could also use a user ID to relate the saved files to a specific user:

```php
public function saveUploadedFile(UploadedFile $file): string
{
    $randomNumber = random_int(1000000, 9999999);
    $fileName = $randomNumber . '.pdf';
    $destinationPath = $this->uploadDirectory . '/' . $file->getClientOriginalName();
    
    try {
        $file->move($this->uploadDirectory, $fileName);
    } catch (\Exception $e) {
        // Throw an exception if the file cannot be saved
        throw new \RuntimeException('Could not save the uploaded file: ' . $e->getMessage());
    }

    return $destinationPath;
}

```


## Step 7: Creating PDFs
The `createPdf(UploadedFile $file)` method creates a PDF file using Imagick methods:
```php
public function createPdf(UploadedFile $file): string
{
    $this->imagick->readImage($file->getRealPath());
    $this->imagick->setImageFormat('pdf');

    $randomNumber = random_int(1000000, 9999999);

    $outputPath = $this->uploadDirectory . '/' . $randomNumber . '.pdf';

    try {
        $this->imagick->writeImages($outputPath, true);
    } catch (\Exception $e) {
        return "Couldn't write image: " . $e->getMessage();
    }

    return $outputPath;
}

```

## Step 7: Merging PDFs
The `mergePdf(array $files)` function uses Imagick methods to create a single PDF from multiple images:
```php
public function mergePdf(array $files, string $companyId): string
{
    try {
        foreach ($files as $file) {
            $this->imagick->readImage($file);
        }

        $randomNumber = random_int(1000000, 9999999);

        $outputPath = $this->uploadDirectory . '/' . $randomNumber . '.pdf';

        // Set image properties and save as PDF
        $this->imagick->setImageUnits(\Imagick::RESOLUTION_PIXELSPERINCH);
        $this->imagick->setResolution(300, 300);
        $this->imagick->setImageFormat('pdf');
        $this->imagick->writeImages($outputPath, true);

        // Return the path to the merged PDF file
        return $outputPath;
    } catch (\Exception $e) {
        // Handle any exceptions and return an error message
        return "merge failed: " . $e->getMessage();
    }
}

```
