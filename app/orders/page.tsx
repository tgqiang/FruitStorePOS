'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ChangeEvent,
  MouseEvent,
  useContext,
  useEffect,
  useState
} from "react";
import { Info, Loader2 } from "lucide-react";
import { InventoryContext } from "@/app/lib/inventory-context";
import * as Table from "@/components/ui/table";
import { Cart } from "@prisma/client";
import { CartItem } from "../lib/data";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import * as Dialog from "@/components/ui/dialog";

export default function Page() {
  const inventoryContext = useContext(InventoryContext);
  const { toast } = useToast();

  const [inputKey, setInputKey] = useState('');
  const [isOwner, setIsOwner] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [reloadOrders, setReloadOrders] = useState(false);
  const [orders, setOrders] = useState(Array<Cart>(0));

  useEffect(() => {
    // Fetch the fruit inventory
    if (reloadOrders) {
      fetch('/api/cart')
        .then((res) => res.json())
        .then((data) => {
          setOrders(data);
          setIsLoading(false);
        })
        .catch((_reason) => {
          setIsError(true);
          setIsLoading(false);
        });
      setReloadOrders(false);
    }
  }, [reloadOrders]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  function formatOrderDate(date: Date) : string {
    // Workaround to convert Prisma-returned Date to a working Date object.
    const obtainedDate = new Date(date);
    return `${obtainedDate.getDate()}-${obtainedDate.getMonth()}-${obtainedDate.getFullYear()} (${obtainedDate.getHours()}:${obtainedDate.getMinutes()}:${obtainedDate.getSeconds()})`;
  }

  function onKeyInputChange(event: ChangeEvent<HTMLInputElement>) {
    setInputKey(event.target.value);
  }

  function onSecretKeySubmit(_event: MouseEvent<HTMLButtonElement>) {
    setIsLoading(true);
    fetch(`/api/validate-owner`, {
      method: 'POST',
      body: JSON.stringify({
        key: inputKey
      })
    })
      .then((res) => {
        if (res.ok) {
          setIsOwner(true);
          setReloadOrders(true);
          setIsLoading(false);
        } else {
          setIsLoading(false);
          setIsOwner(false);
        }
      })
      .catch((_reason) => {
        setIsLoading(false);
        setIsOwner(false);
      });
  }

  function onMarkOrderFulfilled(orderId: string) {
    setIsSubmitting(true);
    fetch(`/api/fulfil`, {
      method: 'POST',
      body: JSON.stringify({
        id: orderId
      })
    })
      .then((res) => {
        if (res.ok) {
          const remainingUnfulfilledOrders = orders.slice();
          remainingUnfulfilledOrders.splice(
            remainingUnfulfilledOrders.findIndex((order) => order.id === orderId),
            1
          );
          setOrders(remainingUnfulfilledOrders);
          onPostMarkOrder();
          toast({
            description: 'Successfully marked this order as fulfilled.'
          });
        } else {
          toast({
            description: 'Failed to mark this order as fulfilled, please try again later.'
          });
          setIsSubmitting(false);
        }
      })
      .catch((_reason) => {
        toast({
          description: 'An error has occurred in the system, please try again later.'
        });
        setIsSubmitting(false);
      });
  }

  function onPostMarkOrder() {
    setIsSubmitting(false);
  }

  if (isLoading) return <p className="text-center">Loading...</p>;
  if (isError) return <p className="text-center">Failed to retrieve data, please try again later.</p>;

  if (!isOwner) {
    return (
      <div className="w-full flex flex-row justify-center p-4 md:p-8">
        <div className="w-full md:w-1/4 flex flex-row flex-wrap justify-center items-center justify-items-center space-x-2">
          <Input className="w-2/3" type="text" placeholder="Enter secret key to view." onChange={onKeyInputChange} />
          <Button onClick={onSecretKeySubmit}>
            {
              isLoading
                ? (<><Loader2 className="animate-spin" /> Please Wait</>)
                : <>Submit</>
          }
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-8">
      <h1 className="text-lg font-semibold py-2">My Orders</h1>
      <p className="py-2"><i>Displays all unfulfilled orders (i.e. you have not received payment and/or delivered the goods).</i></p>
      <Table.Table className="hidden md:table">
        <Table.TableHeader>
          <Table.TableRow>
            <Table.TableHead>S/N</Table.TableHead>
            <Table.TableHead>Date of Order</Table.TableHead>
            <Table.TableHead>Items</Table.TableHead>
            <Table.TableHead>Total Price</Table.TableHead>
            <Table.TableHead>Action</Table.TableHead>
          </Table.TableRow>
        </Table.TableHeader>
        <Table.TableBody>
          {
            orders.map((cart, idx) => (
              <Table.TableRow key={idx}>
                <Table.TableCell className="font-medium">{idx + 1}</Table.TableCell>
                <Table.TableCell className="font-medium">{formatOrderDate(cart.createdAt)}</Table.TableCell>
                <Table.TableCell>
                  <ol>
                    {
                      (cart.items as unknown as Array<CartItem>).map((item) => {
                        return (
                            <li key={item.id}>
                              {
                                `${inventoryContext
                                  .inventory
                                  .find((fruit) => fruit.id === item.id)?.name || ''} (x ${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`
                              }
                            </li>
                        );
                      })
                    }
                  </ol>
                </Table.TableCell>
                <Table.TableCell>$
                  {
                    (cart.items as unknown as Array<CartItem>)
                    .reduce((prev, curr) => prev + curr.price * curr.quantity, 0)
                    .toFixed(2)
                  }
                </Table.TableCell>
                <Table.TableCell>
                  <Button
                    disabled={isSubmitting}
                    onClick={() => onMarkOrderFulfilled(cart.id)}
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : ''}
                    Mark as Fulfilled
                  </Button>
                </Table.TableCell>
              </Table.TableRow>
            ))
          }
        </Table.TableBody>
        <Table.TableFooter>
          <Table.TableRow>
            <Table.TableCell colSpan={4}>Total Unfulfilled Orders</Table.TableCell>
            <Table.TableCell>{orders.length}</Table.TableCell>
          </Table.TableRow>
        </Table.TableFooter>
      </Table.Table>
      <Table.Table className="md:hidden">
        <Table.TableHeader>
          <Table.TableRow>
            <Table.TableHead>S/N</Table.TableHead>
            <Table.TableHead>Total Price</Table.TableHead>
            <Table.TableHead>Action</Table.TableHead>
          </Table.TableRow>
        </Table.TableHeader>
        <Table.TableBody>
          {
            orders.map((cart, idx) => (
              <Table.TableRow key={idx}>
                <Table.TableCell className="font-medium">{idx + 1}</Table.TableCell>
                <Table.TableCell>$
                  {
                    (cart.items as unknown as Array<CartItem>)
                    .reduce((prev, curr) => prev + curr.price * curr.quantity, 0)
                    .toFixed(2)
                  }
                </Table.TableCell>
                <Table.TableCell className="space-x-2">
                  <Dialog.Dialog>
                    <Dialog.DialogTrigger asChild>
                      <Button>
                        <Info /> More Info
                    </Button>
                    </Dialog.DialogTrigger>
                    <Dialog.DialogContent className="sm:max-w-[425px]" aria-description="Order details">
                      <Dialog.DialogHeader>
                        <Dialog.DialogTitle>Order Details</Dialog.DialogTitle>
                      </Dialog.DialogHeader>
                      <div className="flex flex-col justify-center items-center justify-items-center p-4 space-y-4">
                        <p><b>Date of order:</b></p>
                        <p>{formatOrderDate(cart.createdAt)}</p>
                        <ol>
                          {
                            (cart.items as unknown as Array<CartItem>).map((item) => {
                              return (
                                  <li key={item.id}>
                                    {
                                      `${inventoryContext
                                        .inventory
                                        .find((fruit) => fruit.id === item.id)?.name || ''} (x ${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`
                                    }
                                  </li>
                              );
                            })
                          }
                        </ol>
                        <p>
                          <b>Total: </b>$
                          {
                            (cart.items as unknown as Array<CartItem>)
                            .reduce((prev, curr) => prev + curr.price * curr.quantity, 0)
                            .toFixed(2)
                          }
                        </p>
                      </div>
                      <Dialog.DialogFooter>
                        <div className="flex flex-row space-x-4 justify-center items-center justify-items-center">
                          <Dialog.DialogClose asChild>
                            <Button type="button" variant="secondary">
                              Close
                            </Button>
                          </Dialog.DialogClose>
                          <Button
                            disabled={isSubmitting}
                            onClick={() => onMarkOrderFulfilled(cart.id)}
                          >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : ''}
                            Mark as Fulfilled
                          </Button>
                        </div>
                      </Dialog.DialogFooter>
                    </Dialog.DialogContent>
                  </Dialog.Dialog>
                </Table.TableCell>
              </Table.TableRow>
            ))
          }
        </Table.TableBody>
        <Table.TableFooter>
          <Table.TableRow>
            <Table.TableCell colSpan={4}>Total Unfulfilled Orders</Table.TableCell>
            <Table.TableCell>{orders.length}</Table.TableCell>
          </Table.TableRow>
        </Table.TableFooter>
      </Table.Table>
      <div className="w-full flex flex-row justify-center items-center my-4">
        <Link href="/">
          <Button>Back</Button>
        </Link>
      </div>
    </div>
  );
}