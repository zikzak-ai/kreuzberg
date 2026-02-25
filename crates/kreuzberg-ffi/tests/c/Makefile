# C test suite for kreuzberg-ffi
# Usage: make [LIBDIR=path] [INCDIR=path]

HEADER_DIR ?= ../..
LIBDIR ?= ../../../../target/debug
LIBNAME = kreuzberg_ffi

CC ?= cc
CFLAGS = -Wall -Wextra -Werror -I$(HEADER_DIR)

ifeq ($(shell uname),Darwin)
  LDFLAGS = -L$(LIBDIR) -l$(LIBNAME) -framework CoreFoundation -framework Security -lpthread
  RPATH = -Wl,-rpath,$(LIBDIR)
else ifeq ($(OS),Windows_NT)
  LDFLAGS = -L$(LIBDIR) -l$(LIBNAME) -lws2_32 -luserenv -lbcrypt
  RPATH =
else
  LDFLAGS = -L$(LIBDIR) -l$(LIBNAME) -lpthread -ldl -lm
  RPATH = -Wl,-rpath,$(LIBDIR)
endif

TESTS = test_version test_error test_extraction test_mime

.PHONY: all clean

all: $(TESTS)

test_version: test_version.c
	$(CC) $(CFLAGS) -o $@ $< $(LDFLAGS) $(RPATH)

test_error: test_error.c
	$(CC) $(CFLAGS) -o $@ $< $(LDFLAGS) $(RPATH)

test_extraction: test_extraction.c
	$(CC) $(CFLAGS) -o $@ $< $(LDFLAGS) $(RPATH)

test_mime: test_mime.c
	$(CC) $(CFLAGS) -o $@ $< $(LDFLAGS) $(RPATH)

clean:
	rm -f $(TESTS)
