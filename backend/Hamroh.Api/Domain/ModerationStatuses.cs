namespace Hamroh.Api.Domain;

public static class ComplaintStatuses
{
    public const string Open = "Open";
    public const string InReview = "InReview";
    public const string Resolved = "Resolved";
    public const string Rejected = "Rejected";

    public static bool IsValid(string status)
    {
        return status is Open or InReview or Resolved or Rejected;
    }
}

public static class PaymentStatuses
{
    public const string Pending = "Pending";
    public const string Paid = "Paid";
    public const string Failed = "Failed";
    public const string Cancelled = "Cancelled";
    public const string Refunded = "Refunded";

    public static bool IsValid(string status)
    {
        return status is Pending or Paid or Failed or Cancelled or Refunded;
    }
}
