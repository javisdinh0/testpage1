# process-attributes.ps1
# Script to automate researching and processing Tekla Attributes for published articles

$rootDir = "d:\OneDrive\000 ViD Tools\ViDiLab"
$attributesDir = Join-Path $rootDir "Doc\Attributes"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "     iViDLab Tekla Attributes Processor & Packager" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

if (-not (Test-Path $attributesDir)) {
    Write-Error "Attributes directory not found at $attributesDir"
    exit 1
}

# Define mapping for articles and their matching attribute patterns
$mappings = @(
    [PSCustomObject]@{
        Folder = "bolted-gusset"
        HtmlFile = "bolted-gusset-article.html"
        Patterns = @("j11")
        TitleVi = "Tải Về Sample Attributes Giằng Bolted Gusset (11)"
        TitleEn = "Download Bolted Gusset (11) Sample Attributes"
        DescVi = "Bộ tệp cấu hình thuộc tính (Attributes) đã được iViDLab Team tối ưu hóa sẵn. Hãy tải về và chép vào thư mục <code>attributes</code> của mô hình Tekla để sử dụng ngay lập tức:"
        DescEn = "Standard attribute configuration files optimized by the iViDLab Team. Download and copy them into your Tekla model's <code>attributes</code> folder to use instantly:"
    },
    [PSCustomObject]@{
        Folder = "base-plates"
        HtmlFile = "base-plates-article.html"
        Patterns = @("j55", "j71", "j1004")
        TitleVi = "Tải Về Sample Attributes Chân Cột Base Plates"
        TitleEn = "Download Base Plates Sample Attributes"
        DescVi = "Bộ tệp cấu hình thuộc tính chân cột mẫu đã được tối ưu hóa sẵn bởi iViDLab Team:"
        DescEn = "Standard base plate attribute configuration files optimized by the iViDLab Team:"
    }
)

foreach ($map in $mappings) {
    $destFolder = Join-Path $rootDir $map.Folder
    $htmlPath = Join-Path $destFolder $map.HtmlFile
    
    if (-not (Test-Path $htmlPath)) {
        continue
    }
    
    Write-Host "`nProcessing attributes for: $($map.Folder)" -ForegroundColor Yellow
    
    # Strict matching files in Doc/Attributes
    $matchedFiles = @()
    $allFiles = Get-ChildItem -Path $attributesDir -File
    
    foreach ($file in $allFiles) {
        $isMatch = $false
        foreach ($pattern in $map.Patterns) {
            # Case 1: Pattern is a strict extension suffix match (e.g. "j11", "j400000011")
            # If the extension is exactly ".j11" or ".j400000011"
            if (-not $pattern.Contains("*")) {
                $targetExt = "." + $pattern
                if ($file.Extension -eq $targetExt) {
                    $isMatch = $true
                    break
                }
            }
            # Case 2: Pattern is a wildcard match on name (e.g. *(11)*)
            if ($file.Name -like $pattern) {
                $isMatch = $true
                break
            }
        }
        
        if ($isMatch) {
            # Avoid duplicates
            if ($matchedFiles.FullName -notcontains $file.FullName) {
                $matchedFiles += $file
            }
        }
    }
    
    if ($matchedFiles.Count -eq 0) {
        Write-Host "No matching attribute files found for $($map.Folder)." -ForegroundColor DarkGray
        continue
    }
    
    Write-Host "Found $($matchedFiles.Count) matching attribute files." -ForegroundColor Green
    
    $copiedFiles = @()
    
    # Copy and rename files
    foreach ($file in $matchedFiles) {
        # Clean up name: Replace `#A.` or `#D.` or `#A` or `#D` with `iViDLab_`
        $oldName = $file.Name
        $newName = $oldName
        
        if ($newName.StartsWith("#A.")) {
            $newName = "iViDLab_" + $newName.Substring(3)
        } elseif ($newName.StartsWith("#D.")) {
            $newName = "iViDLab_" + $newName.Substring(3)
        } elseif ($newName.StartsWith("#A")) {
            $newName = "iViDLab_" + $newName.Substring(2)
        } elseif ($newName.StartsWith("#D")) {
            $newName = "iViDLab_" + $newName.Substring(2)
        } else {
            if (-not $newName.StartsWith("iViDLab_")) {
                $newName = "iViDLab_" + $newName
            }
        }
        
        # Replace spaces, parentheses with underscores to make web-safe filenames
        $extension = [System.IO.Path]::GetExtension($newName)
        $baseNameWithoutExtension = [System.IO.Path]::GetFileNameWithoutExtension($newName)
        
        $cleanBase = $baseNameWithoutExtension.Replace(" ", "_").Replace("(", "_").Replace(")", "_").Replace("__", "_")
        # Ensure trailing underscores before extension are trimmed
        $cleanBase = $cleanBase.TrimEnd("_")
        $finalName = $cleanBase + $extension
        
        $destPath = Join-Path $destFolder $finalName
        
        # Copy file
        Copy-Item -Path $file.FullName -Destination $destPath -Force
        Write-Host "  Copied & Renamed: $oldName -> $finalName" -ForegroundColor Gray
        $copiedFiles += $finalName
    }
    
    # Read HTML content safely using UTF8 encoding
    $htmlContent = [System.IO.File]::ReadAllText($htmlPath, [System.Text.Encoding]::UTF8)
    
    # If download section already exists, we will strip it first to allow refreshing/overwriting
    $startMarker = "      <!-- ==================== DOWNLOAD SAMPLE ATTRIBUTES ==================== -->"
    $endMarker = "      <!-- ==================== END OF DOWNLOAD SAMPLE ATTRIBUTES ==================== -->"
    
    if ($htmlContent.Contains($startMarker) -and $htmlContent.Contains($endMarker)) {
        Write-Host "Existing attributes download section found. Removing for clean regeneration..." -ForegroundColor Cyan
        $startIndex = $htmlContent.IndexOf($startMarker)
        $endIndex = $htmlContent.IndexOf($endMarker) + $endMarker.Length
        
        # Remove the block and any extra trailing newlines
        $htmlContent = $htmlContent.Remove($startIndex, $endIndex - $startIndex)
    }
    
    # Build HTML block
    $btnGrid = ""
    foreach ($cf in $copiedFiles) {
        $btnGrid += "          <a href=`"$cf`" class=`"btn-outline-white`" download style=`"display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; border-radius: 4px; font-size: 0.9rem; border: 1px solid var(--border); transition: var(--transition); text-decoration: none;`">`r`n            <span>$cf</span>`r`n            <svg width=`"14`" height=`"14`" viewBox=`"0 0 24 24`" fill=`"none`" stroke=`"currentColor`" stroke-width=`"2`" style=`"color: var(--primary);`"><path d=`"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`"/><polyline points=`"7 10 12 15 17 10`"/><line x1=`"12`" y1=`"15`" x2=`"12`" y2=`"3`"/></svg>`r`n          </a>`r`n"
    }
    
    $injectHtml = @"
      <!-- ==================== DOWNLOAD SAMPLE ATTRIBUTES ==================== -->
      <div class="attributes-download-section" style="margin-top: 3.5rem; padding-top: 2.5rem; border-top: 1px solid rgba(255,255,255,0.08);">
        <h3 style="font-family: 'Space Grotesk', sans-serif; color: var(--text-primary); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.6rem; font-size: 1.4rem;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--primary);"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span data-lang="vi">$($map.TitleVi)</span>
          <span data-lang="en">$($map.TitleEn)</span>
        </h3>
        <p style="font-size: 0.98rem; color: var(--text-secondary); margin-bottom: 1.8rem; line-height: 1.7;">
          <span data-lang="vi">$($map.DescVi)</span>
          <span data-lang="en">$($map.DescEn)</span>
        </p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.2rem;">
$btnGrid        </div>
      </div>
      <!-- ==================== END OF DOWNLOAD SAMPLE ATTRIBUTES ==================== -->

"@

    # Find the last </div> before </main> or end of container
    $targetString = "    </div>`r`n  </main>"
    $replacementString = $injectHtml + "    </div>`r`n  </main>"
    
    if ($htmlContent.Contains($targetString)) {
        $htmlContent = $htmlContent.Replace($targetString, $replacementString)
        [System.IO.File]::WriteAllText($htmlPath, $htmlContent, (New-Object System.Text.UTF8Encoding($false)))
        Write-Host "Successfully injected attributes section into $($map.HtmlFile)!" -ForegroundColor Green
    } else {
        # Try with Unix newlines
        $targetStringUnix = "    </div>`n  </main>"
        $replacementStringUnix = $injectHtml + "    </div>`n  </main>"
        if ($htmlContent.Contains($targetStringUnix)) {
            $htmlContent = $htmlContent.Replace($targetStringUnix, $replacementStringUnix)
            [System.IO.File]::WriteAllText($htmlPath, $htmlContent, (New-Object System.Text.UTF8Encoding($false)))
            Write-Host "Successfully injected attributes section (Unix NL) into $($map.HtmlFile)!" -ForegroundColor Green
        } else {
            Write-Warning "Could not find insertion marker in $($map.HtmlFile)."
        }
    }
}
Write-Host "`nAttributes processing completed successfully!" -ForegroundColor Green
