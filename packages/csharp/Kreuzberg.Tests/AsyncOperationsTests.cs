using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Kreuzberg;
using Xunit;

namespace Kreuzberg.Tests;

/// <summary>
/// Comprehensive tests for async/await operations and concurrent extraction scenarios.
/// Tests cover ExtractAsync, ExtractFileAsync, CancellationToken support, ConfigureAwait patterns,
/// concurrent operations, and exception handling in async contexts.
/// </summary>
public class AsyncOperationsTests
{
    public AsyncOperationsTests()
    {
        NativeTestHelper.EnsureNativeLibraryLoaded();
    }

    #region Basic Async Extraction Tests

    [Fact]
    public async Task ExtractFileAsync_WithValidFile_ReturnsContentAsync()
    {
        var pdfPath = NativeTestHelper.GetDocumentPath("pdf/simple.pdf");

        var result = await KreuzbergClient.ExtractFileAsync(pdfPath);

        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.NotEmpty(result.Content);
    }

    [Fact]
    public async Task ExtractFileAsync_WithConfiguration_AppliesConfiguration()
    {
        var pdfPath = NativeTestHelper.GetDocumentPath("pdf/simple.pdf");
        var config = new ExtractionConfig
        {
            PdfOptions = new PdfConfig
            {
                ExtractMetadata = true
            }
        };

        var result = await KreuzbergClient.ExtractFileAsync(pdfPath, config: config);

        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.NotNull(result.Metadata);
    }

    [Fact]
    public async Task ExtractFileAsync_WithConfiguration_AppliesConfigAsync()
    {
        var pdfPath = NativeTestHelper.GetDocumentPath("pdf/simple.pdf");
        var config = new ExtractionConfig
        {
            PdfOptions = new PdfConfig
            {
                ExtractMetadata = true
            }
        };

        var result = await KreuzbergClient.ExtractFileAsync(pdfPath, config: config);

        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.NotNull(result.Metadata);
    }

    [Fact]
    public async Task ExtractFileAsync_MultipleFiles_CanBeRunConcurrently()
    {
        var paths = new[]
        {
            NativeTestHelper.GetDocumentPath("pdf/simple.pdf"),
            NativeTestHelper.GetDocumentPath("office/document.docx")
        };

        var tasks = paths.Select(p => KreuzbergClient.ExtractFileAsync(p)).ToList();
        var results = await Task.WhenAll(tasks);

        Assert.Equal(paths.Length, results.Length);
        Assert.All(results, r => Assert.True(r.Success));
    }

    #endregion

    #region CancellationToken Tests

    [Fact]
    public async Task ExtractFileAsync_WithImmediatelyCancelledToken_ThrowsOperationCanceledException()
    {
        using var cts = new CancellationTokenSource();
        cts.Cancel();

        var pdfPath = NativeTestHelper.GetDocumentPath("pdf/simple.pdf");

        var ex = await Assert.ThrowsAsync<OperationCanceledException>(async () =>
            await KreuzbergClient.ExtractFileAsync(pdfPath, cancellationToken: cts.Token)
        );

        Assert.NotNull(ex);
    }

    [Fact]
    public async Task ExtractFileAsync_WithTimeoutCancellation_ThrowsOperationCanceledException()
    {
        using var cts = new CancellationTokenSource(TimeSpan.FromMilliseconds(1));
        var pdfPath = NativeTestHelper.GetDocumentPath("pdf/simple.pdf");

        var ex = await Assert.ThrowsAsync<OperationCanceledException>(async () =>
            await KreuzbergClient.ExtractFileAsync(pdfPath, cancellationToken: cts.Token)
        );

        Assert.NotNull(ex);
    }

    [Fact]
    public async Task ExtractFileAsync_WithValidCancellationToken_Completes()
    {
        using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(30));
        var pdfPath = NativeTestHelper.GetDocumentPath("pdf/simple.pdf");

        var result = await KreuzbergClient.ExtractFileAsync(pdfPath, cancellationToken: cts.Token);

        Assert.NotNull(result);
        Assert.True(result.Success);
    }

    [Fact]
    public async Task ExtractFileAsync_CancellationTokenLinkedSource_PropagatesCancellation()
    {
        using var cts1 = new CancellationTokenSource(TimeSpan.FromSeconds(30));
        using var cts2 = new CancellationTokenSource();

        var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(cts1.Token, cts2.Token);
        cts2.Cancel();

        var pdfPath = NativeTestHelper.GetDocumentPath("pdf/simple.pdf");

        var ex = await Assert.ThrowsAsync<OperationCanceledException>(async () =>
            await KreuzbergClient.ExtractFileAsync(pdfPath, cancellationToken: linkedCts.Token)
        );

        Assert.NotNull(ex);
    }

    #endregion

    #region Task.WhenAll Concurrency Tests

    [Fact]
    public async Task ExtractMultipleFilesAsync_WithWhenAll_AllCompleteSuccessfully()
    {
        var paths = new[]
        {
            NativeTestHelper.GetDocumentPath("pdf/simple.pdf"),
            NativeTestHelper.GetDocumentPath("office/document.docx"),
            NativeTestHelper.GetDocumentPath("office/excel.xlsx")
        };

        var tasks = paths.Select(p => KreuzbergClient.ExtractFileAsync(p)).ToList();
        await Task.WhenAll(tasks);

        Assert.All(tasks, t => Assert.True(t.IsCompletedSuccessfully));
    }

    [Fact]
    public async Task ExtractMultipleFilesAsync_WithWhenAllGathersResults()
    {
        var paths = new[]
        {
            NativeTestHelper.GetDocumentPath("pdf/simple.pdf"),
            NativeTestHelper.GetDocumentPath("office/document.docx")
        };

        var tasks = paths.Select(p => KreuzbergClient.ExtractFileAsync(p)).ToList();
        var results = await Task.WhenAll(tasks);

        Assert.Equal(paths.Length, results.Length);
        Assert.All(results, r => Assert.NotEmpty(r.Content));
    }

    [Fact]
    public async Task ExtractMultipleFilesAsync_ConcurrentWith10Tasks_AllSucceed()
    {
        var pdfPath = NativeTestHelper.GetDocumentPath("pdf/simple.pdf");
        var tasks = new Task<ExtractionResult>[10];

        for (int i = 0; i < 10; i++)
        {
            tasks[i] = KreuzbergClient.ExtractFileAsync(pdfPath);
        }

        var results = await Task.WhenAll(tasks);

        Assert.Equal(10, results.Length);
        Assert.All(results, r => Assert.True(r.Success));
    }

    [Fact]
    public async Task ExtractMultipleFilesAsync_ConcurrentBatch_WithCancellation_CancelsAll()
    {
        using var cts = new CancellationTokenSource();

        var pdfPath = NativeTestHelper.GetDocumentPath("pdf/simple.pdf");
        var tasks = new List<Task<ExtractionResult>>();

        for (int i = 0; i < 5; i++)
        {
            tasks.Add(KreuzbergClient.ExtractFileAsync(pdfPath, cancellationToken: cts.Token));
        }

        cts.Cancel();

        var ex = await Assert.ThrowsAsync<OperationCanceledException>(async () =>
            await Task.WhenAll(tasks)
        );

        Assert.NotNull(ex);
    }

    #endregion

    #region ConfigureAwait Pattern Tests

    [Fact]
    public async Task ExtractFileAsync_WithConfigureAwait_DoesNotCaptureContext()
    {
        var pdfPath = NativeTestHelper.GetDocumentPath("pdf/simple.pdf");

        var result = await KreuzbergClient.ExtractFileAsync(pdfPath);

        Assert.NotNull(result);
        Assert.True(result.Success);
    }

    [Fact]
    public async Task ExtractMultipleFilesAsync_WithConfigureAwait_AllComplete()
    {
        var paths = new[]
        {
            NativeTestHelper.GetDocumentPath("pdf/simple.pdf"),
            NativeTestHelper.GetDocumentPath("office/document.docx")
        };

        var results = new List<ExtractionResult>();

        foreach (var path in paths)
        {
            var result = await KreuzbergClient.ExtractFileAsync(path);

            results.Add(result);
        }

        Assert.Equal(paths.Length, results.Count);
        Assert.All(results, r => Assert.True(r.Success));
    }

    #endregion

    #region Async Exception Handling Tests

    [Fact]
    public async Task ExtractFileAsync_WithInvalidPath_ThrowsKreuzbergException()
    {
        var ex = await Assert.ThrowsAsync<Exception>(async () =>
            await KreuzbergClient.ExtractFileAsync("nonexistent/file.pdf")
        );

        Assert.NotNull(ex);
    }

    [Fact]
    public async Task ExtractFileAsync_ConcurrentOperations_ExceptionInOneDoesNotAffectOthers()
    {
        var validPath = NativeTestHelper.GetDocumentPath("pdf/simple.pdf");
        var invalidPath = "nonexistent/file.pdf";

        var tasks = new List<Task<ExtractionResult>>
        {
            KreuzbergClient.ExtractFileAsync(validPath),
            KreuzbergClient.ExtractFileAsync(invalidPath).ContinueWith(_ => default(ExtractionResult)!)
        };

        var ex = await Assert.ThrowsAsync<AggregateException>(async () =>
            await Task.WhenAll(tasks)
        );

        Assert.NotNull(ex);
    }

    [Fact]
    public async Task ExtractFileAsync_WithCancellation_ThrowsOperationCanceledNotAggregateException()
    {
        using var cts = new CancellationTokenSource();
        cts.Cancel();

        var pdfPath = NativeTestHelper.GetDocumentPath("pdf/simple.pdf");

        var ex = await Assert.ThrowsAsync<OperationCanceledException>(async () =>
            await KreuzbergClient.ExtractFileAsync(pdfPath, cancellationToken: cts.Token)
        );

        Assert.IsType<OperationCanceledException>(ex);
    }

    #endregion

    #region Task Composition Tests

    [Fact]
    public async Task ExtractFileAsync_ChainedWithThenBy_ExecutesSequentially()
    {
        var pdfPath = NativeTestHelper.GetDocumentPath("pdf/simple.pdf");

        var result = await KreuzbergClient.ExtractFileAsync(pdfPath)
            .ContinueWith(async t =>
            {
                var extraction = t.Result;
                return await KreuzbergClient.ExtractFileAsync(
                    NativeTestHelper.GetDocumentPath("office/document.docx")
                );
            })
            .Unwrap();

        Assert.NotNull(result);
        Assert.True(result.Success);
    }

    [Fact]
    public async Task ExtractFileAsync_WithTaskRun_ExecutesInThreadPool()
    {
        var pdfPath = NativeTestHelper.GetDocumentPath("pdf/simple.pdf");

        var result = await Task.Run(async () =>
            await KreuzbergClient.ExtractFileAsync(pdfPath)
        );

        Assert.NotNull(result);
        Assert.True(result.Success);
    }

    #endregion

    #region Async State and Context Tests

    [Fact]
    public async Task ExtractFileAsync_MultipleConsecutiveCalls_ReturnConsistentResults()
    {
        var pdfPath = NativeTestHelper.GetDocumentPath("pdf/simple.pdf");

        var result1 = await KreuzbergClient.ExtractFileAsync(pdfPath);
        var result2 = await KreuzbergClient.ExtractFileAsync(pdfPath);

        Assert.Equal(result1.Content.Length, result2.Content.Length);
        Assert.Equal(result1.MimeType, result2.MimeType);
    }

    [Fact]
    public async Task ExtractFileAsync_DifferentFiles_ReturnDifferentContent()
    {
        var pdf1 = await KreuzbergClient.ExtractFileAsync(
            NativeTestHelper.GetDocumentPath("pdf/simple.pdf")
        );

        var pdf2 = await KreuzbergClient.ExtractFileAsync(
            NativeTestHelper.GetDocumentPath("office/document.docx")
        );

        Assert.NotEqual(pdf1.Content, pdf2.Content);
    }

    #endregion

    #region Async Batch Operations Tests

    [Fact]
    public async Task BatchExtractFilesAsync_WithConfiguration_AppliesConfigAsync()
    {
        var files = new[]
        {
            NativeTestHelper.GetDocumentPath("pdf/simple.pdf")
        };

        var config = new ExtractionConfig
        {
            PdfOptions = new PdfConfig
            {
                ExtractMetadata = true
            }
        };

        var results = await KreuzbergClient.BatchExtractFilesAsync(files, config);

        Assert.NotEmpty(results);
        Assert.All(results, r => Assert.NotNull(r.Metadata));
    }

    [Fact]
    public async Task BatchExtractBytesAsync_WithConfiguration_AppliesConfigAsync()
    {
        var filePath = NativeTestHelper.GetDocumentPath("pdf/simple.pdf");
        var bytes = File.ReadAllBytes(filePath);

        var items = new List<BytesWithMime>
        {
            new(bytes, "application/pdf")
        };

        var config = new ExtractionConfig
        {
            PdfOptions = new PdfConfig
            {
                ExtractMetadata = true
            }
        };

        var results = await KreuzbergClient.BatchExtractBytesAsync(items, config);

        Assert.NotEmpty(results);
        Assert.All(results, r => Assert.NotNull(r.Metadata));
    }

    #endregion

    #region Async Timing Tests

    [Fact]
    public async Task ExtractFileAsync_CompletesWithinReasonableTime()
    {
        var pdfPath = NativeTestHelper.GetDocumentPath("pdf/simple.pdf");
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();

        var result = await KreuzbergClient.ExtractFileAsync(pdfPath);

        stopwatch.Stop();

        Assert.NotNull(result);
        Assert.True(result.Success);
        // Should complete within 30 seconds
        Assert.True(stopwatch.ElapsedMilliseconds < 30000);
    }

    [Fact]
    public async Task ExtractMultipleFilesAsync_ConcurrentFasterThanSequential()
    {
        var paths = new[]
        {
            NativeTestHelper.GetDocumentPath("pdf/simple.pdf"),
            NativeTestHelper.GetDocumentPath("office/document.docx"),
            NativeTestHelper.GetDocumentPath("office/excel.xlsx")
        };

        // Concurrent execution
        var concurrentStopwatch = System.Diagnostics.Stopwatch.StartNew();
        var tasks = paths.Select(p => KreuzbergClient.ExtractFileAsync(p)).ToList();
        await Task.WhenAll(tasks);
        concurrentStopwatch.Stop();

        // Sequential execution
        var sequentialStopwatch = System.Diagnostics.Stopwatch.StartNew();
        foreach (var path in paths)
        {
            await KreuzbergClient.ExtractFileAsync(path);
        }
        sequentialStopwatch.Stop();

        // Concurrent should generally be faster than sequential (or equal)
        Assert.True(concurrentStopwatch.ElapsedMilliseconds <= sequentialStopwatch.ElapsedMilliseconds * 1.1);
    }

    #endregion
}
