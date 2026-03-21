
$port = 8081
$root = (Resolve-Path "dist").Path
$url = "http://localhost:$port/"

try {
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add($url)
    $listener.Start()
    Write-Host "Server started at $url"
    Write-Host "Serving files from: $root"
    Write-Host "Press Ctrl+C to stop."

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $path = $request.Url.LocalPath
        # Handle the /bam-architect/ prefix by stripping it
        if ($path.StartsWith("/bam-architect/")) {
            $path = $path.Substring(15) # Length of "/bam-architect/" is 15
        }
        
        # Default to index.html
        if ($path -eq "/" -or $path -eq "") {
            $path = "index.html"
        }
        
        # Remove leading slash for Join-Path
        if ($path.StartsWith("/")) {
            $path = $path.Substring(1)
        }

        $filePath = Join-Path $root $path
        Write-Host "Request: $($request.Url.LocalPath) -> Serving: $filePath"
        
        if (Test-Path $filePath -PathType Leaf) {
            try {
                $content = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentLength64 = $content.Length
                
                # Set content type
                $extension = [System.IO.Path]::GetExtension($filePath)
                switch ($extension) {
                    ".html" { $response.ContentType = "text/html" }
                    ".css" { $response.ContentType = "text/css" }
                    ".js" { $response.ContentType = "application/javascript" }
                    ".png" { $response.ContentType = "image/png" }
                    ".jpg" { $response.ContentType = "image/jpeg" }
                    ".svg" { $response.ContentType = "image/svg+xml" }
                    ".json" { $response.ContentType = "application/json" }
                    Default { $response.ContentType = "application/octet-stream" }
                }

                $response.OutputStream.Write($content, 0, $content.Length)
            }
            catch {
                Write-Error "Error reading file: $_"
                $response.StatusCode = 500
            }
        }
        else {
            Write-Warning "File not found: $filePath"
            $response.StatusCode = 404
        }
        
        $response.Close()
    }
}
catch {
    Write-Error "Server error: $($_.Exception.Message)"
}
finally {
    if ($listener) { $listener.Stop() }
}
