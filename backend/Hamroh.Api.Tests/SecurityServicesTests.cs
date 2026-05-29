using FluentAssertions;
using Hamroh.Api.Common;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace Hamroh.Api.Tests;

public sealed class SecurityServicesTests
{
    [Fact]
    public void Password_hash_does_not_store_plaintext()
    {
        var hasher = new PasswordHasher();

        var hash = hasher.Hash("correct-horse-battery-staple");

        hash.Should().NotBe("correct-horse-battery-staple");
        hasher.Verify("correct-horse-battery-staple", hash).Should().BeTrue();
        hasher.Verify("wrong-password", hash).Should().BeFalse();
    }

    [Fact]
    public void Refresh_token_hash_is_stable_and_not_plaintext()
    {
        var config = new ConfigurationBuilder().Build();
        var tokens = new TokenService(config);
        const string refreshToken = "refresh-token-value";

        var first = tokens.HashRefreshToken(refreshToken);
        var second = tokens.HashRefreshToken(refreshToken);

        first.Should().Be(second);
        first.Should().NotBe(refreshToken);
        first.Should().NotBeNullOrWhiteSpace();
    }
}
