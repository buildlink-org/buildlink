import { Card, CardContent } from "@/components/ui/card";

const ProfileProducts = ({ profile }: { profile: any }) => {
  const products = profile?.products || [];

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Products / Services</h2>

        {!products.length ? (
          <p className="text-muted-foreground">No products added.</p>
        ) : (
          <div className="space-y-4">
            {products.map((item: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileProducts;
